const fs = require('fs');
const path = require('path');

let pathName = path.join(__dirname, 'Files');
if (!fs.existsSync(pathName)) {
    fs.mkdirSync(pathName);
}

const animeFilePath = path.join(pathName, 'anime.txt');
const mangaFilePath = path.join(pathName, 'manga.txt');

document.addEventListener('DOMContentLoaded', function() {
    function loadAnimeWishlist() {
        const wishlistContainer = document.getElementById('anime-wishlist');
        fs.readFile(animeFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading anime wishlist file:', err);
                wishlistContainer.innerHTML = '<p>Error loading anime wishlist.</p>';
            } else {
                const animeWishlistItems = data.split('\n').filter(item => item.trim() !== '');
                if (animeWishlistItems.length === 0) {
                    wishlistContainer.innerHTML = '<p>No items in anime wishlist.</p>';
                } else {
                    const table = createWishlistTable(animeWishlistItems, 'anime');
                    wishlistContainer.appendChild(table);
                    addEventListeners(animeFilePath, 'anime'); 
                }
            }
        });
    }

    function loadMangaWishlist() {
        const wishlistContainer = document.getElementById('manga-wishlist');
        fs.readFile(mangaFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading manga wishlist file:', err);
                wishlistContainer.innerHTML = '<p>Error loading manga wishlist.</p>';
            } else {
                const mangaWishlistItems = data.split('\n').filter(item => item.trim() !== '');
                if (mangaWishlistItems.length === 0) {
                    wishlistContainer.innerHTML = '<p>No items in manga wishlist.</p>';
                } else {
                    const table = createWishlistTable(mangaWishlistItems, 'manga');
                    wishlistContainer.appendChild(table);
                    addEventListeners(mangaFilePath, 'manga'); 
                }
            }
        });
    }

    function createWishlistTable(wishlistItems, type) {
        const table = document.createElement('table');
        table.classList.add('wishlist-table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Title</th>
            <th>Status</th>
            <th>Watched Episodes/Volumes</th>
            <th>Actions</th>
        `;
        table.appendChild(headerRow);

        wishlistItems.forEach((item, index) => {
            const [title, status = 'ongoing', watchedEpisodes = 0] = item.split('|');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${title}</td>
                <td>
                    <select class="status-select" data-index="${index}" data-type="${type}">
                        <option value="ongoing" ${status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                        <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="watched-episodes" data-index="${index}" data-type="${type}" value="${watchedEpisodes}" min="0">
                </td>
                <td>
                    <button class="update-button" data-index="${index}" data-type="${type}">Update</button> \n <button class="delete-button" data-index="${index}" data-type="${type}">Delete</button>
                </td>
            `;
            table.appendChild(row);
        });
        return table;
    }

    function addEventListeners(filePath, type) {
        const updateButtons = document.querySelectorAll(`.update-button[data-type="${type}"]`);
        const deleteButtons = document.querySelectorAll(`.delete-button[data-type="${type}"]`);

        updateButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                updateWishlistItem(filePath, index, type);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteWishlistItem(filePath, index, type);
            });
        });
    }

    function updateWishlistItem(filePath, index, type) {
        const statusSelect = document.querySelector(`.status-select[data-index="${index}"][data-type="${type}"]`);
        const watchedInput = document.querySelector(`.watched-episodes[data-index="${index}"][data-type="${type}"]`);

        const newStatus = statusSelect.value;
        const newWatched = watchedInput.value;

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading wishlist file (${filePath}):`, err);
                return;
            }

            let wishlistItems = data.split('\n').filter(item => item.trim() !== '');
            const [title] = wishlistItems[index].split('|');
            wishlistItems[index] = `${title}|${newStatus}|${newWatched}`;

            fs.writeFile(filePath, wishlistItems.join('\n'), 'utf8', (err) => {
                if (err) {
                    console.error(`Error updating wishlist file (${filePath}):`, err);
                } else {
                    console.log('Wishlist updated.');
                    location.reload(); 
                }
            });
        });
    }

    function deleteWishlistItem(filePath, index, type) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading wishlist file (${filePath}):`, err);
                return;
            }

            let wishlistItems = data.split('\n').filter(item => item.trim() !== '');
            wishlistItems.splice(index, 1);

            fs.writeFile(filePath, wishlistItems.join('\n'), 'utf8', (err) => {
                if (err) {
                    console.error(`Error updating wishlist file (${filePath}):`, err);
                } else {
                    console.log('Item deleted from wishlist.');
                    location.reload(); 
                }
            });
        });
    }
    loadAnimeWishlist();
    loadMangaWishlist();
});
