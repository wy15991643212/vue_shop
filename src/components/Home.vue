<template>
    <el-container class="home-container">
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商管理系统</span>
            </div>
            <el-button type="primary" @click="logOut">退出</el-button>
        </el-header>
        <el-container>
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toogleCollapse">|||</div>
                <!--左侧菜单项-->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" unique-opened :collapse='isCollapse' :collapse-transition='false' router 
                :default-active='activePath'>
                    <!--一级菜单-->
                    <!--这里要绑定唯一的index(点击一级菜单，所有的二级菜单不会全部显示) index接受字符串格式数据-->
                    <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                        <!--一级菜单模板-->
                        <template slot="title">
                            <!--图标-->
                            <i :class="iconsObj[item.id]"></i>
                            <!--文字-->
                            <span>{{item.authName}}</span>
                        </template>
                        <!--二级菜单-->
                        <el-menu-item :index="'/' + subItem.path " v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                            <template slot="title">
                                <!--图标-->
                                <i class="el-icon-menu"></i>
                                <!--文字-->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view> 
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name: 'home',
    data() {
        return {
            menuList:[],
            iconsObj:{
                '125':'iconfont icon-users',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            isCollapse:false,
            // 左侧菜单当前高亮的path
            activePath:''
        };
    },
    created(){
        this.getMenuList();
        // 从session Storage中取出点击的二级菜单的path
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        logOut() {
            // 点击退出，清除token  并且跳转到登录页
            window.sessionStorage.clear();
            this.$router.push('/login');
            this.$message.success('退出成功')
        },
       async getMenuList(){
            const {data:res} = await this.$http.get('menus')
            // 判断是否获取成功
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
            // console.log(res)
            this.menuList = res.data;
        },
        // 控制菜单栏的折叠与展开
        toogleCollapse(){
            this.isCollapse = ! this.isCollapse;
        },
        // 点击当前菜单，高亮显示
        saveNavState(activePath){
            window.sessionStorage.setItem('activePath',activePath);
            this.activePath = activePath;
        }
    }
}

</script>
<style lang='less' scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    >div {
        display: flex;
        align-items: center;
        span {
            font-size: 20px;
            color: #FFF;
            margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;
    .el-menu{
        border-right:none;
    }
}

.el-main {
    background-color: #eaedf1;
}
.iconfont{
    margin-right: 8px;
}
.toggle-button{
    background-color: #4a5064;
    color: #fff;
    text-align: center;
    letter-spacing: .2em;
    cursor: pointer;
    font-size: 10px;
    line-height: 24px;
    user-select:none;
}
</style>