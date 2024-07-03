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
                    fetchTotalEpisodes(animeWishlistItems, 'anime', wishlistContainer);
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
                    fetchTotalEpisodes(mangaWishlistItems, 'manga', wishlistContainer);
                }
            }
        });
    }

    function fetchTotalEpisodes(wishlistItems, type, wishlistContainer) {
        const promises = wishlistItems.map(item => {
            const [title] = item.split('|');
            const queryType = type === 'anime' ? 'anime' : 'manga';
            return fetch(`https://api.jikan.moe/v4/${queryType}?q=${encodeURIComponent(title)}`)
                .then(response => response.json())
                .then(data => {
                    const seriesData = data.data[0]; // Assuming the first result is correct
                    const totalEpisodes = type === 'anime' ? seriesData.episodes : seriesData.chapters;
                    return { title, totalEpisodes };
                })
                .catch(err => {
                    console.error('Error fetching total episodes/chapters:', err);
                    return { title, totalEpisodes: 'N/A' };
                });
        });

        Promise.all(promises).then(results => {
            const updatedWishlistItems = wishlistItems.map((item, index) => {
                const [title, status = 'ongoing', watchedEpisodes = 0] = item.split('|');
                const totalEpisodes = results[index].totalEpisodes;
                return `${title}|${status}|${watchedEpisodes}|${totalEpisodes}`;
            });

            const table = createWishlistTable(updatedWishlistItems, type);
            wishlistContainer.appendChild(table);
            addEventListeners(animeFilePath, 'anime');
            addEventListeners(mangaFilePath, 'manga');
        });
    }

    function createWishlistTable(wishlistItems, type) {
        const table = document.createElement('table');
        table.classList.add('wishlist-table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Title</th>
            <th>Status</th>
            <th>Watched/Total</th>
            <th>Actions</th>
        `;
        table.appendChild(headerRow);

        wishlistItems.forEach((item, index) => {
            const [title, status, watchedEpisodes, totalEpisodes] = item.split('|');
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${title}</td>
                <td>
                    <select class="status-select" data-index="${index}" data-type="${type}">
                        <option value="ongoing" ${status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
                        <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="plan-to-watch" ${status === 'plan-to-watch' ? 'selected' : ''}>Plan to Watch</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="watched-episodes" data-index="${index}" data-type="${type}" value="${watchedEpisodes}" min="0">
                    / ${totalEpisodes}
                </td>
                <td>
                    <button class="update-button" data-index="${index}" data-type="${type}">Update</button>
                    <button class="delete-button" data-index="${index}" data-type="${type}">Delete</button>
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
                console.log(`Update button clicked for index ${index}`);
                updateWishlistItem(filePath, index, type);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                console.log(`Delete button clicked for index ${index}`);
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
                    alert('Wishlist updated successfully.');
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
                    alert('Item deleted from wishlist successfully.');
                    location.reload();
                }
            });
        });
    }

    loadAnimeWishlist();
    loadMangaWishlist();
});  