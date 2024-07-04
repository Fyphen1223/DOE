document.addEventListener("DOMContentLoaded", function() {
    let words = dic;

    initAutocomplete();
    function initAutocomplete() {
        const searchBox = document.getElementById('search-box');
        const autocompleteList = document.getElementById('autocomplete-list');
        const wordDetails = document.getElementById('word-details');

        searchBox.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            autocompleteList.innerHTML = '';
            if (!query) return;

            const filteredWords = words.filter(word => word.w.toLowerCase().startsWith(query));
            const maxResults = 10; // 最大表示数
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

        function displayWordDetails(word) {
            wordDetails.innerHTML = `
                <h2>${word.w}</h2>
                <p><strong>説明:</strong> ${word.d}</p>
                <p><strong>語源:</strong> ${word.s}</p>
                <p><strong>覚えるための小ネタ:</strong> ${word.c}</p>
                <p><strong>その他:</strong> ${word.o || "無し"}</p>
            `;
        }
    }
});
