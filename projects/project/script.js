document.addEventListener('DOMContentLoaded', function() {
    // 菜单项点击事件
    const menuItems = document.querySelectorAll('.menu-item');
    const subItems = document.querySelectorAll('.sub-item');
    const contentSections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const hasSubMenu = this.querySelector('.sub-menu');
            if (hasSubMenu) {
                // 有子菜单，阻止默认行为
                e.preventDefault();
            } else {
                // 没有子菜单，处理点击事件
                if (this.classList.contains('active')) return;

                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');

                // 更新页面标题
                const menuText = this.textContent.trim();
                document.querySelector('.page-title').textContent = menuText;

                // 隐藏所有内容区域
                contentSections.forEach(section => {
                    section.style.display = 'none';
                });

                // 显示对应内容区域
                const target = this.dataset.target;
                const targetSection = document.getElementById(target);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
            }
        });
    });

    // 在DOMContentLoaded事件最后添加：
    const frame = document.getElementById('managementFrame');
    if(frame) {
        frame.onload = function() {
            this.style.height = this.contentWindow.document.documentElement.scrollHeight + 'px';
        };
    }

    // 子菜单项点击事件
    subItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有菜单项的 active 类
            menuItems.forEach(i => i.classList.remove('active'));
            subItems.forEach(i => i.classList.remove('active'));

            // 为当前子菜单项添加 active 类
            this.classList.add('active');

            // 找到父菜单项并添加 active 类
            const parentMenuItem = this.closest('.menu-item');
            if (parentMenuItem) {
                parentMenuItem.classList.add('active');
            }

            // 更新页面标题
            const menuText = this.textContent.trim();
            document.querySelector('.page-title').textContent = menuText;

            // 隐藏所有内容区域
            contentSections.forEach(section => {
                section.style.display = 'none';
            });

            // 显示对应内容区域
            const target = this.dataset.target;
            const targetSection = document.getElementById(target);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

    // 用户下拉菜单点击事件
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const action = this.textContent.trim();
            if (action === '修改密码') {
                alert('修改密码功能即将打开');
                // 这里可以添加修改密码的逻辑
            } else if (action === '退出登录') {
                if (confirm('确定要退出登录吗？')) {
                    alert('正在退出登录...');
                    // 这里可以添加退出登录的逻辑
                }
            }
        });
    });

    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', function() {
        document.querySelector('.user-dropdown').style.opacity = '0';
        document.querySelector('.user-dropdown').style.visibility = 'hidden';
        document.querySelector('.user-dropdown').style.transform = 'translateY(10px)';
    });

    // 默认显示首页内容
    const homeMenuItem = document.querySelector('.menu-item[data-target="home"]');
    const homeSection = document.getElementById('home');
    if (homeMenuItem && homeSection) {
        menuItems.forEach(i => i.classList.remove('active'));
        homeMenuItem.classList.add('active');
        document.querySelector('.page-title').textContent = homeMenuItem.textContent.trim();
        contentSections.forEach(section => {
            section.style.display = 'none';
        });
        homeSection.style.display = 'block';
    }
});