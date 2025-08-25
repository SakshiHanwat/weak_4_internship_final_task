let currentEditPost = null;
const posts = JSON.parse(localStorage.getItem('posts')) || [];

function savePosts() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

function getRandomImageUrl() {
    return `https://picsum.photos/seed/${Date.now()}/${Math.floor(Math.random() * 1000)}/600/200`;
}

function renderPosts(filterCategory = 'all', searchQuery = '') {
    const postList = document.getElementById('postList');
    postList.innerHTML = '';
    posts
        .filter(post => filterCategory === 'all' || post.category === filterCategory)
        .filter(post => post.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.dataset.id = post.id;
            
            const img = document.createElement('img');
            img.src = post.imageUrl;
            img.alt = `Image for ${post.title}`;
            
            const title = document.createElement('h3');
            title.textContent = post.title;
            
            const content = document.createElement('p');
            content.textContent = post.content;
            
            const meta = document.createElement('div');
            meta.className = 'post-meta';
            meta.textContent = `${post.category} | ${post.edited ? 'Edited' : 'Posted'} on ${post.timestamp}`;
            
            const actions = document.createElement('div');
            actions.className = 'post-actions';
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => openEditModal(postDiv, post);
            editBtn.style.display = window.location.pathname.includes('index.html') ? 'inline-block' : 'none';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => {
                posts.splice(posts.findIndex(p => p.id === post.id), 1);
                savePosts();
                renderPosts(document.getElementById('categoryFilter')?.value || 'all', document.getElementById('searchBar')?.value || '');
            };
            deleteBtn.style.display = window.location.pathname.includes('index.html') ? 'inline-block' : 'none';
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            postDiv.appendChild(img);
            postDiv.appendChild(title);
            postDiv.appendChild(content);
            postDiv.appendChild(meta);
            postDiv.appendChild(actions);
            postList.appendChild(postDiv);
        });
}

function addPost() {
    const postTitle = document.getElementById('postTitle').value.trim();
    const postContent = document.getElementById('postContent').value.trim();
    const postCategory = document.getElementById('postCategory').value;
    
    if (postTitle === '' || postContent === '') {
        alert('Please enter both a title and content!');
        return;
    }

    const post = {
        id: Date.now().toString(),
        title: postTitle,
        content: postContent,
        category: postCategory,
        timestamp: new Date().toLocaleString(),
        edited: false,
        imageUrl: getRandomImageUrl()
    };
    posts.unshift(post);
    savePosts();
    renderPosts();
    
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}

function openEditModal(postDiv, post) {
    currentEditPost = { postDiv, post };
    document.getElementById('editTitle').value = post.title;
    document.getElementById('editContent').value = post.content;
    document.getElementById('editCategory').value = post.category;
    document.getElementById('editModal').style.display = 'flex';
}

function saveEdit() {
    const newTitle = document.getElementById('editTitle').value.trim();
    const newContent = document.getElementById('editContent').value.trim();
    const newCategory = document.getElementById('editCategory').value;
    
    if (newTitle === '' || newContent === '') {
        alert('Please enter both a title and content!');
        return;
    }
    
    const postIndex = posts.findIndex(p => p.id === currentEditPost.post.id);
    posts[postIndex] = {
        ...currentEditPost.post,
        title: newTitle,
        content: newContent,
        category: newCategory,
        timestamp: new Date().toLocaleString(),
        edited: true
    };
    savePosts();
    renderPosts();
    closeModal();
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditPost = null;
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('postContent')) {
        document.getElementById('postContent').addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addPost();
            }
        });
    }

    if (document.getElementById('searchBar')) {
        document.getElementById('searchBar').addEventListener('input', function() {
            renderPosts(document.getElementById('categoryFilter').value, this.value);
        });
    }

    if (document.getElementById('categoryFilter')) {
        document.getElementById('categoryFilter').addEventListener('change', function() {
            renderPosts(this.value, document.getElementById('searchBar').value);
        });
    }

    document.getElementById('themeToggle').addEventListener('click', function() {
        document.body.classList.toggle('dark');
        this.innerHTML = document.body.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    // Real-time updates with MutationObserver
    const postList = document.getElementById('postList');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('post')) {
                        node.style.animation = 'slideIn 0.3s ease';
                    }
                });
            }
        });
    });
    observer.observe(postList, { childList: true });

    // Character count feedback
    function addCharCountFeedback(input, maxLength) {
        input.addEventListener('input', function() {
            const currentLength = this.value.length;
            this.style.borderColor = currentLength > maxLength * 0.9 ? '#ef4444' : document.body.classList.contains('dark') ? '#4b5563' : '#d1d5db';
        });
    }
    if (document.getElementById('postTitle')) addCharCountFeedback(document.getElementById('postTitle'), 100);
    if (document.getElementById('postContent')) addCharCountFeedback(document.getElementById('postContent'), 1000);
    if (document.getElementById('editTitle')) addCharCountFeedback(document.getElementById('editTitle'), 100);
    if (document.getElementById('editContent')) addCharCountFeedback(document.getElementById('editContent'), 1000);

    // Load saved theme and posts
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    renderPosts();
});