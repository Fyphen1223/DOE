let index = 0;
const wordDetails = document.getElementById('word-details');

async function displayWordDetails(word) {
    wordDetails.innerHTML = `
                <h2>${word.w}</h2>
                <p><strong>説明:</strong> ${word.d}</p>
                <p><strong>語源:</strong> ${word.s}</p>
                <p><strong>覚えるための小ネタ:</strong> ${word.c}</p>
                <p><strong>その他:</strong> ${word.o || "無し"}</p>
                <p><strong>発音:</strong> 取得中</p>
            `;
    const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.w}`);
    const d = await data.json();
    wordDetails.children[5].innerHTML = `<p><strong>発音:</strong> ${d[0]?.phonetic || '不明'}</p>`;
    console.log(d[0]);
};

document.addEventListener("DOMContentLoaded", function() {
    let words = dic;

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
