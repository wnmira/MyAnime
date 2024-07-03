function buttonClicked(){
    var manga_anime = document.getElementById("type_input").value //simpan searhed city dlm variable
    var series = document.getElementById("series_input").value
    fetch(`https://api.jikan.moe/v4/${manga_anime}?q=${series}`)
    .then((response) => response.json())
    .then ((data) => {
        console.log(data)

        for(var i=0;i<2;i++){
            const para = document.createElement("p");
            para.innerText =  `${data.data[i].images.jpg.image_url} Title ${data.data[i].title} \n`
            ///para.innerText =  `Synopsis : ${data.data[i].synopsis} \n`
            //document.body.appendChild(para);
            document.getElementById("myDIV").appendChild(para);
        }                                       
                                        
    })
}
