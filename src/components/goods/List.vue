<template>
    <div>
        <!--顶部面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <el-row>
                <el-col :span="8">
                    <!--搜索框-->
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" class="input-with-select" clearable @clear='getGoodsList' @change='getGoodsList'>
                        <el-button slot="append" icon="el-icon-search" @click='getGoodsList'></el-button>
                    </el-input>
                </el-col>
                <!-- 添加商品按钮-->
                <el-col :span="4">
                    <el-button class="addGoodsBtn" type="primary" @click="goGoodsAdd">添加商品</el-button>
                </el-col>
            </el-row>
            <!--table表格区域-->
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称">
                </el-table-column>
                <el-table-column prop="goods_price" label="商品价格(元)" width="95">
                </el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="70">
                </el-table-column>
                <el-table-column prop="add_time" label="创建时间" width="140">
                    <!--在 main.js 中定义了一个全局的 时间过滤函数dateFormat-->
                    <!--这里使用作用域插槽，得到add_time的数据，进行过滤，渲染成真正的时间-->
                    <template slot-scope='scope'>
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                    <template slot-scope='scope'>
                        <el-button size="mini" type="primary" icon="el-icon-edit">修改</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click='removeGoods(scope.row.goods_id)'>删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--分页区域-->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5,10,15,20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'list',
    data() {
        return {
            // 搜索框双向绑定的数据
            inputData: '',
            // table 表格数据
            tableData: [],
            // 数据总条数
            total: 0,
            // 查询参数对象
            queryInfo: {
                // 查询参数
                query: '',
                // 当前页码
                pagenum: 1,
                // 每页多少条数据
                pagesize: 10,
            }
        };
    },
    created() {
        this.getGoodsList();
    },
    computed: {
        add_time() {
            tableData.add_time
        }
    },
    methods: {
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message('获取商品列表失败')
            this.tableData = res.data.goods;
            this.total = res.data.total;
            console.log(res)
        },
        // 当pageSize发生变化，调用这个函数
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getGoodsList();
        },
        // 当pagenum发生变化
        handleCurrentChange(newNum){
            this.queryInfo.pagenum = newNum;
            this.getGoodsList();
        },
        //  删除商品
        async removeGoods(id){
             const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 判断是否点击了确定
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // console.log(id)
            // 确定删除，发起请求
           const {data:res} = await this.$http.delete('goods/'+ id)
           if(res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            // 更新数据
            this.getGoodsList()
        },
        goGoodsAdd(){
            this.$router.push('/goods/add')
        }

    }
}

</script>
<style lang='less' scoped>
.addGoodsBtn {
    margin-left: 20px;
}
.el-pagination{
    margin-top:20px;
}
</style>