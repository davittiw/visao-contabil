const toggleMenu = document.getElementById('toggleMenu');
        const sidebar = document.getElementById('sidebar');
        const menuLinks = document.querySelectorAll('.menu-link');

        toggleMenu.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                menuLinks.forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !toggleMenu.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });