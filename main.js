var titlePattern = /"[\S\s]{1,}?"/g;

var timePerLetter = 100;
var redditLastId = "";

var quoteCardTransitionDuration = 1000; // This should match css element .quote-onscreen
var splashScreenDuration = 3000; // Should give a bit of time for data to load

// Runtime variables
var firstLaunch = true;
var quoteCard = 1;
var currentQuote = 0;

var redditTitles = [];
var earthpornUrls = [];
var quotes = [];
var authors = [];

$(document).ready(function(){
    loadAnotherPage();
    loadEarthporn();
    
    
    // Show help on click
    $(document).click(function(){
        $("#menu").toggleClass("active");
    });
    
});

function currentQuoteCard(){
    return $(".quote"+quoteCard);
}
function nextQuoteCard(){
    return $(".quote"+(3-quoteCard));
}
function enableCssAnim(elem, enabled){
    if(enabled){
        elem.addClass("quote-onscreen");
        elem.removeClass("quote-offscreen");
    }
    else{
        elem.addClass("quote-offscreen");
        elem.removeClass("quote-onscreen");
    }
}

function changeQuote(){
    
    // Animate cards
    var currentCard = currentQuoteCard();
    var nextCard = nextQuoteCard();
    enableCssAnim(nextCard, true);
    setTimeout(function(){
        // Things that play after the animation finished
        enableCssAnim(currentCard, false);
        currentCard.css("z-index", "1");
        nextCard.css("z-index", "0");
        
        // Set properties of next card (which is currently the current one)
        setBackground(currentCard);
        currentCard.find(".text-quote").html(quotes[currentQuote]);
        currentCard.find(".text-author").html(authors[currentQuote]);
        
    }, quoteCardTransitionDuration);
    
    // Select card for next update
    quoteCard = (quoteCard%2)+1;
    
    currentQuote++;
    
    //Do we have to load another page from reddit?
    if(currentQuote > quotes.length){
        loadAnotherPage();
    }
    
    // Set the time we display the current quote by the number of letters in the current one
    var quoteText = quotes[currentQuote-1];
    var authorText = authors[currentQuote-1];
    var changeTime = 0;
    if(quoteText && authorText)
        changeTime = (quoteText.length + authorText.length) * timePerLetter;
    // Reduce wait time on launch
    if(firstLaunch){
        changeTime = splashScreenDuration;
        firstLaunch = false;
    }
    setTimeout(changeQuote, changeTime);
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
        
        if(firstLaunch){
            changeQuote();
        }
    });
}

function setBackground(elem){
    if(elem != null){
        elem.css("background-image", "url("+earthpornUrls[Math.floor(Math.random() * earthpornUrls.length)]+")");
    }
}