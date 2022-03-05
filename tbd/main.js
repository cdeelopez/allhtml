const setupGame = (guessme) => {
    let html = '<div>'
    let isSpace = false
    for (const chr of guessme) {
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
    const guessme = phrases[1].toUpperCase()
    const guessmeLetters = guessme.replaceAll(' ', '')
    const lettersCnt = guessmeLetters.length
    let counter = 0
    let showInterval
    let displayed = 0

    const endGame = () => {
        clearInterval(showInterval)
        showInterval = undefined
        displayLostPopup()
        
        setStats(items.LOSSES, grades.F)
    }

    const displayLostPopup = () => {
        $(".error-popup h2").addClass(grades.F)
        $(".error-popup p").text(guessme)
        $(".error-popup").show()
    }

    const winGame = () => {
        const pct = (displayed / lettersCnt) * 100
        const grade = getGrade(pct)
        displayWonPopup(grade)
        const currGradeCount = localStorage.getItem(grade) || 0
        localStorage.setItem(grade, parseInt(currGradeCount) + 1)
        setStats(items.WINS, grade)
    }

    const displayWonPopup = (grade) => {
        $(".win-popup h2").addClass(grade)
        $(".win-popup").show()
    }

    const showLetter = (isSettingUp) => {
        const letter = pattern[counter]
        if(!isSettingUp) setGameState(counter)
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
            showLetter(isSettingUp)
        }
    }
    
    setupGame(guessme)
    const todaysState = getTodaysStat()
    if(todaysState) {
        while(counter <= todaysState.counter)
            showLetter(true)
        if(todaysState.isComplete) {
            if(todaysState.didWin) displayWonPopup(todaysState.grade)
            else displayLostPopup(grades.F)
        }
    }

    if (typeof showInterval === 'undefined'){
        if(!todaysState || (todaysState && !todaysState.isComplete))
            showInterval = setInterval(showLetter, 3000)
    } else {
        clearInterval(showInterval)
    }

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

    $(".main-section").on("keyup", "input[type='text']", (e) => {
        const inputs = $(e.target).closest(".guessbox").find("input[type='text']")
        if(e.keyCode == 8) {
            inputs.eq(Math.max(inputs.index(e.target) - 1, 0))
                .val("")
                .focus()

        } else {
            inputs.eq(inputs.index(e.target) + 1).focus();
        }
    })

    // const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    // console.log(randomizeItems(alphabet))

});

const setGameState = (counter) => {
    localStorage.setItem(items.GAME_STATE, `{ "counter": ${counter} }` )
}

const getTodaysStat = () => {
    const lastPlayed = localStorage.getItem(items.LAST_PLAYED)
    const todaysDt = getTodaysDt()
    if(lastPlayed != todaysDt) {
        localStorage.setItem(items.LAST_PLAYED,todaysDt)
        localStorage.removeItem(items.GAME_STATE)
    }

    return getGameState()
}

const getGameState = () => {
    const state = localStorage.getItem(items.GAME_STATE)
    if(!state) return state
    return $.parseJSON(state)
}

const setupWithTodaysState = () => {
    const state = localStorage.getItem(items.GAME_STATE)
    if(!state) return
    const gameState = $.parseJSON(state)
    console.log(gameState)
}

const onGuess = () => {
    const guessContent = $(".guessbox").clone()
    $(guessContent).find("span").each(function() {
        if(!$(this).text().trim().length) {
            $(this).html("<input type='text' maxlength='1'>")
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

const setStats = (stat, grade) => {
    const cnt = localStorage.getItem(stat) || 0
    localStorage.setItem(stat, parseInt(cnt) + 1)
    const currStats = getGameState()
    currStats.didWin = stat === items.WINS
    currStats.isComplete = true
    currStats.grade = grade
    localStorage.setItem(items.GAME_STATE, JSON.stringify(currStats))
}

const getGrade = (pct) => {
    if(pct >= 0 && pct <= 40.0) return grades.A
    else if(pct > 40.0 && pct <= 60.0) return grades.B
    else if(pct > 60.0 && pct <= 80.0) return grades.C
    else return grades.D
}

const getTodaysDt = () => {
    const dt = new Date()
    return `${dt.getMonth()+1}/${dt.getDate()}/${dt.getFullYear()}`
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

const items = {
    WINS: "res-wins",
    LOSSES: "res-losses",
    LAST_PLAYED: "last-played-date",
    GAME_STATE: "game-state",
}

const grades = {
    A: "grade-a",
    B: "grade-b",
    C: "grade-c",
    D: "grade-d",
    F: "grade-f",
}
