var redditTitles = [];
var quotes = [];
var authors = [];
var earthpornUrls = [];
var titlePattern = /"[\S\s]{1,}?"/g;

var timePerLetter = 100;
var currentQuote = 0;
var redditLastId = "";

$(document).ready(function(){
    loadAnotherPage();
    loadEarthporn();
});

function changeQuote(){
    
    $("#quote").html(quotes[currentQuote]);
    $("#author").html(authors[currentQuote]);
    setBackground();
    currentQuote++;
    
    //Do we have to load another page from reddit?
    if(currentQuote > quotes.length){
        $("#quote").html("Loading more");
        loadAnotherPage();
        return;
    }
    
    //Set the time we display the current quote by the number of letters in the current one
    setTimeout(changeQuote, (quotes[currentQuote].length + authors[currentQuote].length) * timePerLetter);
}

function loadEarthporn(){
    $.getJSON("http://www.reddit.com/r/earthporn/.json", function(json){
        for(var i = 0; i < json.data.children.length; i++){
            var url = json.data.children[i].data.url;
            //Do we have a valid image?
            if(/(.jpg)$/gm.test(url)){
                earthpornUrls.push(url);
            }
        }
        setBackground();
    });
}

function loadAnotherPage(){
    $.getJSON("http://www.reddit.com/r/quotes/.json?count=25&after=t3_"+redditLastId, function(json){
        //Resets
        quotes = [];
        authors = [];
        redditTitles = [];
        currentQuote = 0;
        
        //Read raw titles
        for(var i = 0; i < json.data.children.length; i++){
            redditTitles[i] = json.data.children[i].data.title;
            redditLastId = json.data.children[i].data.id;
        }
        
        for(var i = 0; i < redditTitles.length; i++){
            //Do we have a valid quote?
            var pos = redditTitles[i].search(titlePattern);
            if(pos > -1){
                var quote = redditTitles[i].match(titlePattern)[0];
                var author = redditTitles[i].substr(quote.length, redditTitles[i].length - quote.length);
                author = author.trim();
                
                quotes.push(quote);
                authors.push(author);
            }
        }
        
        changeQuote();
    });
}

function setBackground(){
    $("#background").attr("src", earthpornUrls[Math.floor(Math.random() * earthpornUrls.length)]);
}