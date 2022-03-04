const setupGame = (guessme) => {
    let html = '<div>'
    let isSpace = false
    for (const chr of guessme) {
        //const c = chr === " " ? "space" : "letter"
        if (chr === " ") { 
            isSpace = true 
            html += '</div><div>'
        }
        else {
            html += `<span class="${isSpace ? "has-space" : ""}"></span>`
            isSpace = false
        }
    }
    html += '</div>'

    $(".guessbox").html(html)
}
$(function() {
    // todo get one per day
    const guessme = phrases[0].toUpperCase()
    const guessmeLetters = guessme.replaceAll(' ', '')
    const lettersCnt = guessmeLetters.length
    let counter = 0
    let showInterval
    let displayed = 0
    
    setupGame(guessme)

    $(".guess-now").on("click", () => {
        onGuess()
        clearInterval(showInterval)
        showInterval = undefined
    })

    $(".main-section").on("click", ".submit", () => {
        const yes = onGuessSubmit(guessmeLetters)
        $(".guess-popup").hide()
        if (yes) winGame()
        else endGame()
    })

    const showLetter = () => {
        const letter = pattern[counter]
        if (counter >= pattern.length) {
            endGame()
            return
        }
        const chr = guessmeLetters.indexOf(letter) 
        if(chr != -1) {
            guessmeLetters.split("").forEach((c, i) => {
                if(c == letter) {
                    const el = $(".guessbox span").get(i)
                    $(el).text(letter)
                    displayed++
                }
            })
            if (displayed == lettersCnt) {
                endGame()
                return
            }
            counter++
        }
        else {
            counter++
            showLetter()
        }
    }

    const endGame = () => {
        clearInterval(showInterval)
        showInterval = undefined
        $(".error-popup p").text(guessme)
        $(".error-popup").show()
    }

    const winGame = () => {
        const pct = (displayed / lettersCnt) * 100
        $(".win-popup p").text(`${pct.toFixed(2)}%`)
        $(".win-popup").show()
    }
        
    if (typeof showInterval === 'undefined'){
        showLetter()
        counter++
        showInterval = setInterval(showLetter, 5000)
    } else {
        clearInterval(showInterval)
    }

    // const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    // console.log(randomizeItems(alphabet))

});

const onGuess = () => {
    const guessContent = $(".guessbox").clone()
    $(guessContent).find("span").each(function() {
        if(!$(this).text().trim().length) {
            $(this).html("<input type='text'>")
        }
    })
    const guessContentHtml = $(guessContent).html()
    $(".main-section").append(`
        <div class="popup guess-popup">
            <div class="content">
                <div class="guessbox">${guessContentHtml}</div>
                <span class="guess-action submit">Submit</span>
            </div>
        </div>
    `)
    $(".guess-popup").show()
    $(".guess-popup input").first().focus()
}

const onGuessSubmit = (answer) => {
    let guess = ''
    $(".guess-popup .guessbox span").each(function() {
        if($(this).find("input").length) {
            guess += $(this).find("input").val() || ""
        } else guess += $(this).text() || ""
    })
    if(guess.toUpperCase() == answer) {
        return true
    } 
    return false
}

const randomizeItems = (items) => items
        .map((a) => ({sort: Math.random(), value: a}))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value)

const pattern = ['D','L','Z','F','E','K','B','O','P','V','T','G','S','A','C','U','N','I','H','R','Y','J','M','X','Q','W']

const phrases = [
    "A great place to unwind",
    "A hop skip and a jump",
    "A little rest and recuperation",
    "A mile a minute",
    "Based on actual events"
]
