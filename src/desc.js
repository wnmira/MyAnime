const fs = require('fs');
const path = require('path');

let pathName = path.join(__dirname, 'Files');
if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName);
}

const animeFilePath = path.join(pathName, 'anime.txt');
const mangaFilePath = path.join(pathName, 'manga.txt');

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type'); 
    const series = urlParams.get('series');
    const index = parseInt(urlParams.get('index'), 10);

    fetch(`https://api.jikan.moe/v4/${type}?q=${series}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            const detailsContainer = document.getElementById('desc');
            detailsContainer.innerHTML = '';

            if (data.data[index]) {
                const item = data.data[index];

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const addButton = document.createElement("button");
                addButton.innerText = "Add to List";
                addButton.className = "add-button";
                buttonContainer.appendChild(addButton);

                const wishlistButton = document.createElement("button");
                wishlistButton.innerText = "Wishlist";
                wishlistButton.className = "wishlist-button";
                wishlistButton.addEventListener('click', function() {
                    window.location.href = 'wishlist.html';
                });
                buttonContainer.appendChild(wishlistButton);

                detailsContainer.appendChild(buttonContainer);

                addButton.addEventListener('click', function() {
                    addToList(item.title, type);
                });

                const img = document.createElement("img");
                img.src = item.images.jpg.image_url;
                img.alt = item.title;
                detailsContainer.appendChild(img);

                const title = document.createElement('h2');
                title.innerText = item.title;
                detailsContainer.appendChild(title);

                const createSection = (titleText, contentText) => {
                    const section = document.createElement('div');
                    section.className = 'section';

                    const titleElement = document.createElement('h3');
                    titleElement.className = 'section-title';
                    titleElement.innerText = titleText;

                    const contentElement = document.createElement('p');
                    contentElement.className = 'section-content';
                    contentElement.innerText = contentText;

                    section.appendChild(titleElement);
                    section.appendChild(contentElement);
                    detailsContainer.appendChild(section);
                };

                createSection('Synopsis', item.synopsis || 'No synopsis available.');
                createSection('Score', item.score || 'N/A');
                createSection('Rank', item.rank || 'N/A');
                createSection('Popularity', item.popularity || 'N/A');
                createSection('Genres', item.genres ? item.genres.map(g => g.name).join(', ') : 'N/A');
                createSection('Producers', item.producers ? item.producers.map(p => p.name).join(', ') : 'N/A');
                createSection('Source', item.source || 'N/A');
                createSection('Rating', item.rating || 'N/A');
                createSection('Released', item.aired ? item.aired.string : 'N/A');

                if (type === 'anime') {
                    createSection('Total Episodes', item.episodes || 'N/A');
                } else if (type === 'manga') {
                    createSection('Total Chapters', item.chapters || 'N/A');
                }

                const malLinkSection = document.createElement('div');
                malLinkSection.className = 'section';

                const malLinkTitle = document.createElement('h3');
                malLinkTitle.className = 'section-title';
                malLinkTitle.innerText = 'Link';

                const malLinkContent = document.createElement('p');
                const malLink = document.createElement("a");
                malLink.href = `https://myanimelist.net/${type}/${item.mal_id}`;
                malLink.innerText = "MyAnimeList";
                malLink.target = "_blank";
                malLinkContent.appendChild(malLink);

                malLinkSection.appendChild(malLinkTitle);
                malLinkSection.appendChild(malLinkContent);
                detailsContainer.appendChild(malLinkSection);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            const detailsContainer = document.getElementById('desc');
            detailsContainer.innerHTML = '<p>Error loading data.</p>';
        });
});

let animeList = [];
let mangaList = [];

function addToList(title, type) {
    if (type === 'anime' && !animeList.includes(title)) {
        animeList.push(title);
        console.log("Added to anime list:", title);
        alert(`${title} has been added to your anime list.`);
        addWishlistFile(animeFilePath, animeList);
    } else if (type === 'manga' && !mangaList.includes(title)) {
        mangaList.push(title);
        console.log("Added to manga list:", title);
        alert(`${title} has been added to your manga list.`);
        addWishlistFile(mangaFilePath, mangaList);
    } else {
        alert(`${title} is already in your list.`);
    }
}

function addWishlistFile(filePath, list) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        let wishlistData = [];
        if (!err && data) {
            wishlistData = data.split('\n').filter(Boolean);
        }

        list.forEach(title => {
            if (!wishlistData.includes(title)) {
                wishlistData.push(title);
            }
        });

        fs.writeFile(filePath, wishlistData.join('\n'), (err) => {
            if (err) {
                console.error('Error writing to wishlist file:', err);
            } else {
                console.log('Wishlist updated.');
            }
        });
    });
}
