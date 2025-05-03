// Debug helper
function debug(message) {
    console.log(`[YouTubeHashtagGenerator] ${message}`);
}

// Get DOM elements
const form = document.getElementById('hashtagForm');
const generateBtn = document.getElementById('generateBtn');
const resultContainer = document.getElementById('resultContainer');
const hashtagsList = document.getElementById('hashtagsList');
const loading = document.getElementById('loading');
const csvBtn = document.getElementById('csvBtn');
const csvActions = document.getElementById('csvActions');
const downloadBtn = document.getElementById('downloadBtn');
const mainTopicInput = document.getElementById('mainTopic');
const contentDescriptionInput = document.getElementById('contentDescription');
const mainTopicError = document.getElementById('mainTopicError');
const contentDescriptionError = document.getElementById('contentDescriptionError');

let generatedHashtags = [];
let csvData = null;

// YouTube hashtag database (categorized)
const hashtagDatabase = {
    gaming: ['#gaming', '#videogames', '#gamer', '#gameplay', '#gamingcommunity', '#gaminglife', '#gamingtips', '#pcgaming', '#consolegaming', '#gamingsetup'],
    tutorial: ['#tutorial', '#howto', '#stepbystep', '#learn', '#education', '#guide', '#diy', '#tips', '#tutorialvideo', '#learning'],
    vlog: ['#vlog', '#dailyvlog', '#vlogger', '#vlogging', '#vloglife', '#dailylife', '#vlogsquad', '#vlogchannel', '#lifestylevlog', '#vlogmas'],
    comedy: ['#comedy', '#funny', '#humor', '#laugh', '#comedyvideo', '#funnyvideos', '#standup', '#jokes', '#comedian', '#comedysketch'],
    music: ['#music', '#musicvideo', '#newmusic', '#song', '#musician', '#artist', '#singer', '#rap', '#hiphop', '#livemusic'],
    tech: ['#tech', '#technology', '#gadgets', '#review', '#smartphone', '#computer', '#techreview', '#electronics', '#technews', '#techupdates'],
    cooking: ['#cooking', '#food', '#recipe', '#chef', '#homemade', '#cook', '#foodie', '#kitchen', '#foodrecipe', '#cookingvideo'],
    beauty: ['#beauty', '#makeup', '#tutorial', '#skincare', '#makeuptutorial', '#beautytips', '#cosmetics', '#beautyblogger', '#haircare', '#beautyproducts'],
    fitness: ['#fitness', '#workout', '#gym', '#fitnessmotivation', '#exercise', '#training', '#fitnesstips', '#homeworkout', '#weightloss', '#fitnessjourney'],
    travel: ['#travel', '#travelguide', '#adventure', '#explore', '#wanderlust', '#traveldiaries', '#vacation', '#tourism', '#destination', '#travelvlog'],
    education: ['#education', '#learning', '#study', '#knowledge', '#student', '#teaching', '#school', '#college', '#teacher', '#onlinelearning'],
    business: ['#business', '#entrepreneur', '#marketing', '#smallbusiness', '#startup', '#success', '#businesstips', '#entrepreneurship', '#businessadvice', '#motivation'],
    automotive: ['#car', '#cars', '#auto', '#automotive', '#carreview', '#supercar', '#carsofyoutube', '#carblog', '#carphotography', '#carenthusiast'],
    unboxing: ['#unboxing', '#newgadget', '#productreview', '#review', '#techunboxing', '#unbox', '#packagedelivery', '#newtech', '#gadgetreview', '#smartphones'],
    animation: ['#animation', '#animator', '#animated', '#cartoon', '#3danimation', '#animationvideo', '#stopmotion', '#animationstudio', '#animationart', '#motiondesign'],
    sports: ['#sports', '#athlete', '#sportsnews', '#football', '#basketball', '#soccer', '#baseball', '#nba', '#nfl', '#sportshighlights'],
    lifestyle: ['#lifestyle', '#dailylife', '#lifestylevlog', '#lifestylechannel', '#lifestylechange', '#lifeadvice', '#motivation', '#inspiration', '#positivevibes', '#mindfulness'],
    reaction: ['#reaction', '#reactionvideo', '#react', '#reactchannel', '#reacts', '#reacting', '#trending', '#moviereaction', '#funnyreactions', '#reacttomusic'],
    pets: ['#pets', '#dog', '#cat', '#animals', '#puppy', '#kitten', '#dogtraining', '#dogsofyoutube', '#catsofyoutube', '#cutepets']
};

const trendingHashtags = ['#trending', '#viral', '#recommended', '#youtube', '#youtubechannel', '#youtuber', '#youtubevideo', '#newvideo', '#subscribe', '#contentcreator'];
const engagementHashtags = ['#comment', '#like', '#share', '#notification', '#subscribe', '#followme', '#support', '#community', '#fanbase', '#engagement'];
const popularityWords = ['trending', 'viral', 'popular', 'best', 'top', 'recommended', 'mustsee', 'exclusive', 'featured', 'premiere'];

// Validate input
function validateInput(input, errorElement, fieldName) {
    if (!input.value.trim()) {
        errorElement.textContent = `${fieldName} is required.`;
        return false;
    }
    if (input.value.length > 100) {
        errorElement.textContent = `${fieldName} cannot exceed 100 characters.`;
        return false;
    }
    errorElement.textContent = '';
    return true;
}

// Generate specific hashtags
function getSpecificHashtags(keywords, mainTopic) {
    let specific = [];
    keywords.forEach(keyword => {
        const kw = keyword.toLowerCase().trim().replace(/\s+/g, '');
        if (kw) {
            specific.push(`#${kw}`);
            specific.push(`#${mainTopic}${kw}`);
            specific.push(`#${kw}tips`);
            const randomPopWord = popularityWords[Math.floor(Math.random() * popularityWords.length)];
            specific.push(`#${kw}${randomPopWord}`);
        }
    });
    return specific;
}

// Generate hashtags
function generateHashtags() {
    debug('Generate button clicked');

    // Show loading, hide results
    loading.style.display = 'block';
    resultContainer.style.display = 'none';
    hashtagsList.innerHTML = '';
    csvActions.style.display = 'none';
    downloadBtn.style.display = 'none';
    downloadBtn.href = '#';

    // Get form values
    const mainTopic = document.getElementById('mainTopic').value.trim().toLowerCase();
    const specificTagsInput = document.getElementById('specificTags').value;
    const specificTags = specificTagsInput ? specificTagsInput.split(',').map(k => k.trim()).filter(k => k) : [];
    const channelSize = document.getElementById('channelSize').value;
    const videoLength = document.getElementById('videoLength').value;
    const description = document.getElementById('contentDescription').value.trim();

    // Validate inputs
    if (!mainTopic || !description) {
        alert('Please fill in Video Category and Video Description.');
        loading.style.display = 'none';
        return;
    }

    debug('Inputs: ' + mainTopic + ', ' + specificTags + ', ' + channelSize + ', ' + videoLength + ', ' + description);

    // Generate hashtags
    try {
        let allHashtags = [];

        // Add category-specific hashtags
        const categoryHashtags = hashtagDatabase[mainTopic.toLowerCase()] || [];
        allHashtags.push(...categoryHashtags.slice(0, 5));
        if (!categoryHashtags.length) {
            allHashtags.push(`#${mainTopic}`, `#${mainTopic}video`, `#${mainTopic}content`);
        }

        // Add specific tags
        if (specificTags.length) {
            allHashtags.push(...getSpecificHashtags(specificTags, mainTopic).slice(0, 4));
        }

        // Add channel size-specific hashtags
        if (channelSize === 'small') {
            allHashtags.push('#supportsmallcreators', '#newcreator', `#${mainTopic}community`);
            allHashtags.push(...trendingHashtags.slice(0, 2));
        } else if (channelSize === 'large') {
            allHashtags.push(...trendingHashtags.slice(0, 4));
            allHashtags.push(...engagementHashtags.slice(0, 2));
        } else {
            allHashtags.push(...trendingHashtags.slice(0, 3));
            allHashtags.push(...engagementHashtags.slice(0, 1));
        }

        // Add video length-specific hashtags
        if (videoLength === 'short') {
            allHashtags.push('#shorts', '#shortvideo', '#quicktips');
        } else if (videoLength === 'long') {
            allHashtags.push('#longform', '#indepth', '#detailed');
        }

        // Extract keywords from description
        const extractedWords = description
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 4 && !['there', 'their', 'about', 'would', 'could', 'should', 'these', 'those', 'which', 'where', 'when', 'what'].includes(word))
            .slice(0, 2);
        allHashtags.push(...extractedWords.map(word => `#${word}`));

        // Remove duplicates and limit to 15 (YouTube's practical limit)
        allHashtags = [...new Set(allHashtags)].slice(0, 15);

        // Create hashtag sets
        generatedHashtags = [];

        // Set 1: Popular Mix
        const popularMix = [trendingHashtags[0], `#${mainTopic}`, videoLength === 'short' ? '#shorts' : '#video'];
        generatedHashtags.push({ type: 'popular', label: 'Popular', tags: popularMix.join(' ') });

        // Set 2: Topic-Focused
        const topicFocused = [`#${mainTopic}`];
        specificTags.forEach(tag => topicFocused.push(`#${tag.trim()}`));
        while (topicFocused.length < 5) {
            const randomIndex = Math.floor(Math.random() * allHashtags.length);
            topicFocused.push(allHashtags[randomIndex]);
        }
        generatedHashtags.push({ type: 'medium', label: 'Medium', tags: [...new Set(topicFocused)].join(' ') });

        // Set 3: Balanced Mix
        const balancedMix = [];
        balancedMix.push(trendingHashtags[1], engagementHashtags[0], `#${mainTopic}`);
        if (specificTags.length) balancedMix.push(`#${specificTags[0]}`);
        while (balancedMix.length < 5) {
            const randomIndex = Math.floor(Math.random() * allHashtags.length);
            balancedMix.push(allHashtags[randomIndex]);
        }
        generatedHashtags.push({ type: 'medium', label: 'Medium', tags: [...new Set(balancedMix)].join(' ') });

        // Set 4: Content-Specific
        const contentSpecific = [`#${mainTopic}`];
        extractedWords.forEach(word => contentSpecific.push(`#${word}`));
        while (contentSpecific.length < 5) {
            const randomIndex = Math.floor(Math.random() * allHashtags.length);
            contentSpecific.push(allHashtags[randomIndex]);
        }
        generatedHashtags.push({ type: 'niche', label: 'Niche', tags: [...new Set(contentSpecific)].join(' ') });

        // Set 5: Optimal Mix
        const optimalMix = allHashtags.slice(0, 10);
        generatedHashtags.push({ type: 'popular', label: 'Popular', tags: optimalMix.join(' ') });

        debug('Generated hashtag sets: ' + generatedHashtags.length);

        // Simulate processing time
        setTimeout(() => {
            // Create hashtag cards
            generatedHashtags.forEach(set => {
                const hashtagCard = document.createElement('div');
                hashtagCard.className = 'hashtag-card';
                hashtagCard.innerHTML = `
                    <div class="hashtag-text">
                        <span class="hashtag-popularity ${set.type}">${set.label}</span>
                        ${set.tags}
                        <span class="hashtag-count">${set.tags.split(' ').length} hashtags</span>
                    </div>
                    <button class="copy-btn" data-hashtags="${set.tags}">Copy</button>
                `;
                hashtagsList.appendChild(hashtagCard);
            });

            // Show results and hide loading
            resultContainer.style.display = 'block';
            csvActions.style.display = 'block';
            loading.style.display = 'none';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    } catch (err) {
        debug('Error generating hashtags: ' + err.message);
        alert('An error occurred while generating hashtags. Please try again.');
        loading.style.display = 'none';
    }
}

// Copy text to clipboard
function copyToClipboard(text, button) {
    debug('Copying to clipboard: ' + text);
    try {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => button.textContent = 'Copy', 2000);
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = 'Copy', 2000);
        }
    } catch (err) {
        debug('Copy failed: ' + err.message);
        alert('Failed to copy. Please copy manually.');
    }
}

// Convert hashtags to CSV
function convertToCSV() {
    debug('Converting to CSV');
    if (!generatedHashtags.length) {
        alert('No hashtags to convert. Please generate hashtags first.');
        return;
    }
    try {
        let csvContent = 'YouTube Hashtags\n';
        generatedHashtags.forEach((set, index) => {
            const setType = set.label;
            const escapedHashtags = `"${set.tags.replace(/"/g, '""')}"`;
            csvContent += `${setType} Set,${escapedHashtags}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        csvData = url;
        downloadBtn.href = url;
        downloadBtn.setAttribute('download', 'youtube_hashtags.csv');
        downloadBtn.style.display = 'inline-block';
        csvBtn.textContent = 'CSV Created!';
        setTimeout(() => csvBtn.textContent = 'Convert to CSV File', 2000);
    } catch (err) {
        debug('CSV conversion failed: ' + err.message);
        alert('Failed to create CSV. Please try again.');
    }
}

// Download the CSV file
function downloadCSV() {
    debug('Downloading CSV');
    if (!csvData) {
        alert('Please convert to CSV first.');
        return;
    }
    try {
        downloadBtn.textContent = 'Downloading...';
        setTimeout(() => downloadBtn.textContent = 'Download CSV', 2000);
    } catch (err) {
        debug('CSV download failed: ' + err.message);
        alert('Failed to download CSV. Please try again.');
    }
}

// Bind events
form.addEventListener('submit', e => {
    e.preventDefault();
    debug('Form submitted');

    // Validate inputs
    const isMainTopicValid = validateInput(mainTopicInput, mainTopicError, 'Video Category');
    const isDescriptionValid = validateInput(contentDescriptionInput, contentDescriptionError, 'Video Description');
    if (!isMainTopicValid || !isDescriptionValid) return;

    generateHashtags();
});

hashtagsList.addEventListener('click', e => {
    if (e.target.classList.contains('copy-btn')) {
        const hashtags = e.target.getAttribute('data-hashtags');
        copyToClipboard(hashtags, e.target);
    }
});

csvBtn.addEventListener('click', convertToCSV);
downloadBtn.addEventListener('click', downloadCSV);

// Real-time validation
mainTopicInput.addEventListener('input', () => validateInput(mainTopicInput, mainTopicError, 'Video Category'));
contentDescriptionInput.addEventListener('input', () => validateInput(contentDescriptionInput, contentDescriptionError, 'Video Description'));

debug('Script initialized');