let index = 0;
const wordDetails = document.getElementById('word-details');

let d = null;
let audioUrl = null;

async function displayWordDetails(word) {
    wordDetails.innerHTML = `
                <h2>${word.w}</h2>
                <p><strong>説明:</strong> ${word.d}</p>
                <p><strong>語源:</strong> ${word.s}</p>
                <p><strong>覚えるための小ネタ:</strong> ${word.c}</p>
                <p><strong>その他:</strong> ${word.o || "無し"}</p>
                <p><strong>発音:</strong> 取得中</p>
                <p><strong>聞く:</strong> 取得中</p>
                <p><strong>Origin:</strong> 取得中</p>
                <p><strong>例文:</strong> 取得中</p>
            `;
    const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.w}`);
    d = await data.json();

    wordDetails.children[7].innerHTML = `<p><strong>Origin:</strong> ${d[0]?.origin || '見つかりませんでした'}</p>`;
    audioUrl = null;
    d[0].phonetics.forEach((ph) => {
         if(!ph.audio) return;
        audioUrl = ph.audio;
    });
    wordDetails.children[5].innerHTML = `<p><strong>発音:</strong> ${d[0]?.phonetic || '見つかりませんでした'}</p>`;
    wordDetails.children[6].innerHTML = `<p><strong>聞く:</strong> ${audioUrl ? '<button onclick="playAudio()">再生</button>' : '見つかりませんでした'}</p>`;
    const example = await generateExample(word.w);
    wordDetails.children[8].innerHTML = `<p><strong>例文:</strong> ${example || '見つかりませんでした'}</p>`;
};

function playAudio() {
    const audio = new Audio(audioUrl);
    audio.play();
}

function getDuplicateWords(words) {
    const duplicates = {};
    let i = 0;
    for (const wordObj of words) {
        i++;
        const word = wordObj.w;
        if (duplicates[word]) {
            duplicates[word] += 1;
        } else {
            duplicates[word] = 1;
        }
    }
    const result = [];
    for (const [word, count] of Object.entries(duplicates)) {
        if (count > 1) {
            result.push(word);
        }
    }
    console.log(i);
    return result;
}



document.addEventListener("DOMContentLoaded", function() {
    let words = dic;

    console.log(getDuplicateWords(dic));
    
    initAutocomplete();
    function initAutocomplete() {
        const searchBox = document.getElementById('search-box');
        const autocompleteList = document.getElementById('autocomplete-list');

        searchBox.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            autocompleteList.innerHTML = '';
            if (!query) return;
            index = 0;
            const filteredWords = words.filter(word => word.w.toLowerCase().startsWith(query));
            if(filteredWords.length == 0) return;
            const maxResults = 10;
            filteredWords.slice(0, maxResults).forEach(word => {
                const item = document.createElement('div');
                item.textContent = word.w;
                item.addEventListener('click', function() {
                    searchBox.value = word.w;
                    displayWordDetails(word);
                    autocompleteList.innerHTML = '';
                });
                autocompleteList.appendChild(item);
            });
        });
    }
});

window.addEventListener('keydown', (ev) => {
    const autocompleteList = document.getElementById('autocomplete-list');
    const searchBox = document.getElementById('search-box');
    if(!autocompleteList.innerHTML) return;

    if(ev.key === 'ArrowUp') {
        if(index == 0) return;
        index--;
        autocompleteList.querySelectorAll('*').forEach((ch) => {
            ch.classList.remove('selection');
        });
        autocompleteList.children[index].classList.add('selection');
    };
    if(ev.key === 'ArrowDown') {
        if(index >= autocompleteList.children.length - 1) return;
        index++;
        autocompleteList.querySelectorAll('*').forEach((ch) => {
            ch.classList.remove('selection');
        });
        autocompleteList.children[index].classList.add('selection');
    }
    if(ev.key === 'Enter') {
        const ctx = autocompleteList.children[index].textContent;
        const foundWord = dic.find(word => word.w === ctx);
        searchBox.value = foundWord.w;
        displayWordDetails(foundWord);
        autocompleteList.innerHTML = '';
    }
});

async function generateExample(word) {
    const res = await fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user', content: 'From now on, you will receive a word from user. Please generate an example sentence and translation in Japanese for the sentence that you generated. Not an explanation. This is the format: "<EXAMPLE SENTENCE>" : <TRANSLATION FOR THE SENTENCE> . This is the proper example: \"The government abolished the plan. : 政府はそのプランを廃止した。\". This is a bad example: \"Abolish: 廃止\".'
                },
                {
                    role: 'assistant', content: 'Ok.'
                }
            ],
            prompt: word,
            model: "gpt-3.5-turbo",
            markdown: false
        })
    });
    const response = await res.json();
    return response.gpt;
}

async function generateTranslation(word) {
    const res = await fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'user', content: 'From now on, you will receive sentences from user. Please translate the sentences into Japanese. Not an explanation. This is the format: <TRANSLATION FOR THE SENTENCE> .'
                },
                {
                    role: 'assistant', content: 'Ok.'
                }
            ],
            prompt: word,
            model: "gpt-3.5-turbo",
            markdown: false
        })
    });
    const response = await res.json();
    return response.gpt;
}