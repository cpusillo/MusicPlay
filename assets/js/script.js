$(document).ready(function () {
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();

    //create an array and store in a variable to hold the user input.
    var store = [];
    setRecentSearches();

    /* TIM */
    var apiKeyYT = "AIzaSyDdYbxab_e4wYPLQ1aBj9bDswbk5VH26wI";
    var queryURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&channelID=UC2pmfLm7iq6Ov1UwYrWYkZA&maxResults=6&regionCode=US&type=video&videoCategoryId=10&key=" + apiKeyYT;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);

        var trendItems = (response.items);
        var trendlink = "https://youtu.be/";

        for (var i = 0; i < trendItems.length; i++) {


            trendlink += (response.items[i].id.videoId);

            // console.log(trendlink)

            var trendThumb = (response.items[i].snippet.thumbnails.medium.url)
            var trendImage = $("<img>").attr("src", trendThumb)
            trendImage.addClass("responsive-img");
            $("#trendRow").append(trendImage)

            var trendTitle = (response.items[i].snippet.title)
            var trendtitleEl = $("<p>").text(trendTitle)
            $("#trendRow").append(trendtitleEl)


        }
    });

    /* CORRINE */
    // Determine what our submit button does.
    $("#submitBtn").on("click", function (e) {

        // Grab and trim our user input boxes.
        var artist = $("#inputArtist").val().trim();
        var song = $("#inputTrack").val().trim();


        // Pass input to the getMusic function, running MusixMatch API.
       getMusic(artist, song);


        //create a variable to store the inputs the user makes to the artist and song parameters
        var searched = {
            artist,
            song
        };

        // Push our object in our array of objects, store.
        store.push(searched);
        // Pass our array of objects into local storage.
        localStorage.setItem("search", JSON.stringify(store));


        /*
        The getMusic() function, accepts two args, artist and song, parses
        the input and queries the MusixMatch API for matching song lyrics.
         */
        function getMusic(artist, song) {

            // Get the lyrics

            // Format the string to work with the API method call requirements.
            songScrubbed = song.replace(/ /g, '%20');
            artistScrubbed = artist.replace(/ /g, '%20');

            // Build the queryURL.
            var queryURL1 = "https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?format=jsonp&callback=callback&q_track=" + songScrubbed + "&q_artist=" + artistScrubbed + "&apikey=09147d8948de232b91be633e58a1abbd&callback=?";

            // Make the AJAX call, using getJSON as indicated by API docs.
            $.getJSON(queryURL1, function (data) {
                console.log(data);
                console.log("matcher.lyrics.get");

                // Get the status code.
                var statusCode = data.message.header.status_code;
                var lyrics = data.message.body.lyrics.lyrics_body;

                console.log(lyrics)

                // Pass input to the getVideo function, running Youtube API.
               getVideo(artist, song, lyrics, statusCode);

            }); // getJSON
        } // getMusic()

        function getVideo(artist, song, lyrics, statusCode) {

            // Build our search string.
            var search = "";
            search += artist + " " + song;
            var apiKey = "AIzaSyCou3PEzut2mTwROkqH9_uxZHK1wktkG-E"
            var queryURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&key=" + apiKey + "&type=video&q=" + search;

            // Create our AJAX call, using the jQuery .ajax() method.
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {

                // Build the video link.
                var videoLink = "https://youtu.be/" //Concatenate with video ID for full link.
                videoLink += response.items[0].id.videoId;
                //console.log(videoLink);

                // Get the video title
                var title = response.items[0].snippet.title;
                var li = $("<li>");
                li.addClass("music-display")
                searchedContent = $(".searchedContent")


                var titleEL = $("<a>");
                titleEL.attr("href", videoLink);
                titleEL.text(title);
                titleEL.appendTo(li);
                

                // Get the thumbnail picture
                var thumbnailURL = response.items[0].snippet.thumbnails.medium.url;
                var thumbnailEL = $("<img>");
                thumbnailEL.addClass("img-responsive youtubeThumb");
                thumbnailEL.attr("src", thumbnailURL);

              
                var lyricsP = $("<p>");
                lyricsP.addClass("lyrics")
                // If status code is 404 (not found), tell the user to try again.
                if (statusCode === 404) {
                    lyricsP.text("No lyrics found, try again!")
                } else if (statusCode !== 400 && lyrics !== "") {

                    lyricsP.text(lyrics);

                } else if (statusCode !== 400 && lyrics === "") {
                    lyricsP.text("Unfortunately, we are unable to show these lyrics due to copyright laws");
                }

                thumbnailEL.appendTo(li);
                lyricsP.appendTo(li);
                li.appendTo(searchedContent);
                var br = $("<br>");
                br.appendTo(searchedContent);
 
            }); // .ajax();
        }; // getVideo();

    });

    /*
        setRecentSearches() displays the user's previous session's searches
        on the UI underneath the search results.
    */

    /* CHIAGOZIE */
function setRecentSearches() {
    // Get our data out of local storage.
    var allSearched = JSON.parse(localStorage.getItem("search"));

    // If local storage is empty, display a message for the user.
    if (allSearched === null) {
        console.log("Nothing in recent")
        var li = $("<li>");
        li.addClass("no-searches")
        li.text("No searches here yet!")
        li.appendTo($(".recentSearches"));
    } // If local storage has values, display them to the user.
    else {
        store = store.concat(allSearched)
        $(".no-searches").remove();
        for (var i = 0; i < allSearched.length; i++) {
            var li = $("<li>");
            li.html(allSearched[i].artist + ": " + allSearched[i].song);
            li.appendTo($(".recentSearches"));
        }
    }
}


}); // End of document