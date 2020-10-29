$(document).ready(function () {
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();

    //create an array and store in a variable to hold the user input.
    var store = [];
    setRecentSearches()

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

        store.push(searched);
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
            var apiKey = "AIzaSyAB_alANYNG1k_KvSDF9zRgl22yJbSgH7k" //AIzaSyA7hF4td_eyZElEdkQBfnMuCHF1SfQWIS0 
            var queryURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&key=" + apiKey + "&type=video&q=" + search;

            // Create our AJAX call, using the jQuery .ajax() method.
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                //console.log("Here is the Youtube API JSON response: ")
                //console.log(response);

                //console.log("Here is the response drilled down into the video items: ")
                //console.log(response.items);

                // Build the video link.
                var videoLink = "https://youtu.be/" //Concatenate with video ID for full link.
                videoLink += response.items[0].id.videoId;
                //console.log(videoLink);

                // Get the video title
                var title = response.items[0].snippet.title;
                console.log(title);
                var titleEL = $("<a>");
                titleEL.attr("href", videoLink);
                titleEL.text(title);
                searchResults = $(".search-results")

                var row = $("<div>");
                row.addClass("row");
                var cols3 = $("<div>"); // For the thumbnail
                cols3.addClass("col s3")
                var cols8 = $("<div>"); // For the lyrics & song title
                cols8.addClass("col s8");



                // If status code is 404 (not found), tell the user to try again.
                if (statusCode === 404) {
                    cols8.text("No lyrics found, try again!")
                } else if (statusCode !== 400 && lyrics !== "") {

                    cols8.text(lyrics);

                } else if (statusCode !== 400 && lyrics === "") {
                    cols8.text("Unfortunately, we are unable to show these lyrics due to copyright laws");
                }

                // Get the thumbnail picture
                var thumbnailURL = response.items[0].snippet.thumbnails.medium.url;
                var thumbnailEL = $("<img>");
                thumbnailEL.addClass("youtube-thumbnail");
                thumbnailEL.attr("src", thumbnailURL);

                cols3.append(thumbnailEL)
                cols3.append($("<br/>"));
                cols3.append(titleEL);

                row.append(cols3);
                row.append(cols8);
                searchResults.append(row);

            }); // .ajax();
        }; // getVideo();
    });

    function setRecentSearches() {

        var allSearched = JSON.parse(localStorage.getItem("search"));

        if (allSearched === null) {
            var li = $("<li>");
            li.addClass("no-searches");
            li.text("No searches here yet!");
            li.appendTo($("#recentSearches"));
        }

        else {
            $(".no-searches").remove();

            for (var i = 0; i < allSearched.length; i++) {
                var li = $("<li>");
                li.html(allSearched[i].artist + ": " + allSearched[i].song);
                li.appendTo($("#recentSearches"));
            };
        };


    }; // KEEP CODE ABOVE HERE




});
