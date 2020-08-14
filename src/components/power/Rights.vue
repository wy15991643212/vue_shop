<template>
    <div style="height:100%">
        <!--顶部面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card class="box-card">
            <el-table :data="rightsList" border stripe>
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column prop="authName" label="权限名称" width="180">
                </el-table-column>
                <el-table-column prop="path" label="路径" width="180">
                </el-table-column>
                <el-table-column prop="level" label="权限等级">
                    <template slot-scope='scope'>
                        <el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level === '1'">二级权限</el-tag>
                        <el-tag type="warning" v-else>三级权限</el-tag>
                    </template>
                </el-table-column>
            </el-table>
            
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'rights',
    data() {
        return {
            rightsList: []
        };
    },
    created() {
        this.getRightList()
    },
    methods: {
        // 获取所有权限列表
        async getRightList() {
            const { data: res } = await this.$http.get('rights/list');
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error("获取权限列表失败")
            //成功
            this.rightsList = res.data;
        },
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
        },
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
        }
    }
}

</script>
<style lang='less' scoped>
</style>