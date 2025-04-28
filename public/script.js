let sviFilmovi = [];
let kosarica = [];

fetch('/filmtv_movies.csv')
  .then(response => response.text())
  .then(csvText => {
    const rezultat = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });

    sviFilmovi = rezultat.data.map(film => ({
      title: film.title,
      genre: film.genre,
      year: Number(film.year),
      duration: Number(film.duration),
      avg_vote: Number(film.avg_vote)
    }));

    prikaziFilmove(sviFilmovi);
  })
  .catch(error => {
    console.error('Greška pri dohvaćanju CSV-a:', error);
  });


function prikaziFilmove(filmovi) {
    const tbody = document.querySelector('#filmovi-tablica tbody');
    tbody.innerHTML = ''; 

    const prvih20Filmova = filmovi.slice(0, 20);

    prvih20Filmova.forEach((film, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${film.title}</td>
            <td>${film.genre}</td>
            <td>${film.year}</td>
            <td>${film.duration}</td>
            <td>${film.avg_vote}</td>
            <td><button class="dodaj-btn" data-index="${index}">Dodaj u košaricu</button></td>
        `;  
        // tu dodajemo svakom filmu button koji nam sluzi za dodavanje u kosaricu
        tbody.appendChild(row);
    });

    document.querySelectorAll('.dodaj-btn').forEach(button => {
        button.addEventListener('click', () => {
            const index = button.getAttribute('data-index');
            dodajUKosaricu(prvih20Filmova[index]);
        });
    });
}





const durationInput = document.getElementById('filter-duration');
const durationDisplay = document.getElementById('duration-value');

durationInput.addEventListener('input', () => {
    durationDisplay.textContent = durationInput.value;
});

function filtriraj() {
    const odabraniZanrovi = Array.from(document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.value.toLowerCase());
    const minimalnaGodina = document.getElementById('filter-year').value;
    const minimalnaOcjena = parseFloat(document.getElementById('filter-rating').value);
    const minimalnaTrajanje = parseInt(document.getElementById('filter-duration').value);

    const filtriraniFilmovi = sviFilmovi.filter(film => {
        const filmZanr = film.genre ? film.genre.toLowerCase() : '';
        const uvjetZanr = odabraniZanrovi.length === 0 || (film.genre && odabraniZanrovi.some(zanr => filmZanr.includes(zanr)));
        const uvjetGodina = minimalnaGodina === "" || film.year >= Number(minimalnaGodina);
        const uvjetOcjena = film.avg_vote >= minimalnaOcjena;
        const uvjetTrajanje = film.duration >= minimalnaTrajanje;

        return uvjetZanr && uvjetGodina && uvjetOcjena && uvjetTrajanje;
    });


    const tbody = document.querySelector('#filmovi-tablica tbody');
    tbody.innerHTML = '';

    if (filtriraniFilmovi.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 20px;">
                Nema filmova koji odgovaraju zadanim filterima.
            </td>
        `;
        tbody.appendChild(row);
    } else {
        prikaziFilmove(filtriraniFilmovi);
    }
}








// kosarica
function dodajUKosaricu(film) {
    if (!kosarica.some(item => item.title === film.title)) {
        kosarica.push(film);
        osvjeziKosaricu();
        alert(`${film.title} dodan u košaricu!`);
    } else {
        alert('Film je već u košarici!');
    }
}

function osvjeziKosaricu() {
    const lista = document.getElementById('lista-kosarice');
    if (!lista) {
        console.error('Lista košarice nije pronađena!');
        return;
    }
    lista.innerHTML = '';

    kosarica.forEach((film, index) => {
        const li = document.createElement('li');
        li.textContent = `${film.title} (${film.year})`;
        const ukloniBtn = document.createElement('button');
        ukloniBtn.textContent = 'Ukloni';
        ukloniBtn.addEventListener('click', () => {
            ukloniIzKosarice(index);
        });
        li.appendChild(ukloniBtn);
        lista.appendChild(li);
    });
}

function ukloniIzKosarice(index) {
    const uklonjeniFilm = kosarica.splice(index, 1)[0];
    osvjeziKosaricu();
    alert(`${uklonjeniFilm.title} uklonjen iz košarice!`);
}

document.getElementById('potvrdi-kosaricu').addEventListener('click', () => {
    if (kosarica.length === 0) {
        alert('Košarica je prazna!');
    } else {
        alert(`Uspješno ste dodali ${kosarica.length} film${kosarica.length === 1 ? '' : 'ova'} u svoju košaricu za vikend maraton!\n\nFilmovi koje ste dodali:\n${kosarica.map(film => `${film.title} (${film.year})`).join('\n')}`);
        kosarica = [];
        osvjeziKosaricu();
    }
});




// filterriiii
document.getElementById('primijeni-filtere').addEventListener('click', filtriraj);


document.getElementById('resetiraj-filtere').addEventListener('click', resetirajFiltere);

function resetirajFiltere() {
  const zanrovi = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
  zanrovi.forEach(checkbox => checkbox.checked = false);

  document.getElementById('filter-year').value = '';
  document.getElementById('filter-rating').value = 5;

  const durationInput = document.getElementById('filter-duration');
  durationInput.value = 60;
  document.getElementById('duration-value').textContent = '60';

  prikaziFilmove(sviFilmovi);
}
