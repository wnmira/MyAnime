function buttonClicked() {
    var manga_anime = document.getElementById("type_input").value;
    var series = document.getElementById("series_input").value;

    fetch(`https://api.jikan.moe/v4/${manga_anime}?q=${series}`)
    .then((response) => response.json())
    .then((data) => {
        console.log(data);

        const resultsContainer = document.getElementById("myDIV");
        resultsContainer.innerHTML = '';

        for (var i = 0; i < 10; i++) {
            const card = document.createElement("div");
            card.className = "result-card";

            const img = document.createElement("img");
            img.src = data.data[i].images.jpg.image_url; 
            card.appendChild(img);

            const content = document.createElement("div");
            content.className = "content";

            const title = document.createElement("h2");
            title.innerText = data.data[i].title; 
            content.appendChild(title);

            const score = document.createElement("p");
            score.innerText = `Score: ${data.data[i].score}`;
            content.appendChild(score);

            const rank = document.createElement("p");
            rank.innerText = `Rank: ${data.data[i].rank}`;
            content.appendChild(rank);

            const popularity = document.createElement("p");
            popularity.innerText = `Popularity: ${data.data[i].popularity}`;
            content.appendChild(popularity);

            card.appendChild(content);

            const actions = document.createElement("div");
            actions.className = "actions";

            const button = document.createElement("button");
            button.innerText = "Learn more";
            button.addEventListener("click", (function(i) {
                return function() {
                    window.location.href = `desc.html?type=${manga_anime}&series=${encodeURIComponent(series)}&index=${i}`;
                }
            })(i));

            actions.appendChild(button);
            card.appendChild(actions);

            resultsContainer.appendChild(card);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
