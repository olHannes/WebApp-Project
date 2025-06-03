let lastProjects = [];

function initFilter() {
    lastProjects = [...window['projects']]
    .sort((a, b) => new Date(b.end_date) - new Date(a.end_date))
    .slice(0, 3);
}

function showLastProjects() {
    const projectContainer = document.getElementById('lastProjectView');
    projectContainer.innerHTML = '';
    
    lastProjects.forEach(project => {
        const article = document.createElement('article');
        
        const h2 = document.createElement('h2');
        const a = document.createElement('a');
        a.href = `projectView/projectView.html?id=${project.id}`;
        a.textContent = project.title;
        h2.appendChild(a);
        
        const p = document.createElement('p');
        p.textContent = project.short_description;
        
        article.appendChild(h2);
        article.appendChild(p);
        projectContainer.appendChild(article);
    });
}

function startSearch(searchTxt) {
    const filtered = window['projects'].filter(project =>
        project.title.toLowerCase().includes(searchTxt.toLowerCase())
        || project.short_description.toLowerCase().includes(searchTxt.toLowerCase())
    );
    lastProjects = filtered.slice(0, 3);
    showLastProjects();
}


document.addEventListener('DOMContentLoaded', () => {
  initFilter();
  showLastProjects();
});
