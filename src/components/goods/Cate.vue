<template>
    <div>
        <!--顶部面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片区域-->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCateBtn">添加分类</el-button>
                </el-col>
            </el-row>
            <!--表格区域-->
            <tree-table :data='cateList' :columns="columns" :selection-type='false' :expand-type='false' show-index index-text='#' border>
                <!--是否有效-->
                <template slot="isOk" slot-scope='scope'>
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:#67C23A"></i>
                    <i class="el-icon-error" style="color:#F56C6C" v-else></i>
                </template>
                <!--排序-->
                <template slot="order" slot-scope='scope'>
                    <el-tag size='medium' v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag size='medium' type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag size='medium' type="warning" v-else>三级</el-tag>
                </template>
                <!--操作-->
                <template slot="opt" slot-scope='scope'>
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateFrom(scope.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>
            <!--分页区域-->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2,5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
            <!--添加分类对话框-->
            <el-dialog title="添加分类" :visible.sync="showAddCateDialog" width="50%" @close='addCateDialogClosed'>
                <el-form :model="addCateForm" :rules="addCaterules" ref="addCateFormRef" label-width="100px">
                    <!--分类名称-->
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类">
                        <!--options 用来指定数据源-->
                        <!--props 用来指定配置对象-->
                        <el-cascader v-model="selectedKeys" :options="ParentCateList" :props="cascaderProps" @change="parentCateChange" clearable change-on-select></el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showAddCateDialog = false">取 消</el-button>
                    <el-button type="primary" @click="addCate">确 定</el-button>
                </span>
            </el-dialog>
            <!--编辑分类对话框-->
            <el-dialog title="编辑分类" :visible.sync="elitdialogVisible" width="50%" @close='elitDialogClosed'>
                <el-form :model="editCateForm" :rules="editCateRules" ref="editFormRef" label-width="100px" class="demo-ruleForm">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="editCateForm.cat_name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="elitdialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editCate">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'cate',
    data() {
        return {
            // 商品分类数据列表
            cateList: [],
            // 查询条件
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 获取到数据的总数量
            total: 0,
            //为table 指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    prop: 'cat_deleted',
                    // 指定 自定义列模板
                    type: 'template',
                    // 自定义列模板，对应的作用域插槽
                    template: 'isOk'
                },
                {
                    label: '排序',
                    prop: 'cat_level',
                    // 指定 自定义列模板
                    type: 'template',
                    // 自定义列模板，对应的作用域插槽
                    template: 'order'
                },
                {
                    label: '操作',
                    // prop:'cat_level',
                    // 指定 自定义列模板
                    type: 'template',
                    // 自定义列模板，对应的作用域插槽
                    template: 'opt'
                }
            ],
            // 是否显示添加分类对话框
            showAddCateDialog: false,
            // 添加分类表单
            addCateForm: {
                // 父分类id  不能为空，如果要添加1级分类，则父分类Id应该设置为  `0`
                cat_pid: 0,
                // 分类名称
                cat_name: '',
                // 分类层级 `0`表示一级分类；`1`表示二级分类；`2`表示三级分类
                cat_level: 0
            },
            // 添加分类验证规则
            addCaterules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 前两级的 所有父级分类
            ParentCateList: [],
            //指定级联选择器的配置对象
            cascaderProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                // checkStrictly:true,
                children: 'children'
            },
            // 选中的父级分类的 id 数组
            selectedKeys: [],
            // 编辑分类对话框是否显示
            elitdialogVisible: false,
            // 编辑分类表单
            editCateForm: {
            },
            //编辑分类表单验证规则
            editCateRules: {
                cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
            },
            //
        };
    },
    created() {
        this.getCateList();
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取分类列表失败')
            // console.log(res)
            this.cateList = res.data.result;
            this.total = res.data.total
        },
        // 监听每页多少条数据变化
        handleSizeChange(val) {
            this.queryInfo.pagesize = val;
            this.getCateList();
        },
        // 监听当前页码变化
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val;
            this.getCateList();
        },
        // 添加分类按钮
        addCateBtn() {
            this.getParentCateList();
            this.showAddCateDialog = true;
        },
        // 获取所有父级分类列表
        async getParentCateList() {
            // 只需要获取前两级    因为只有3级
            const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
            if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败')
            this.ParentCateList = res.data;
            // console.log(this.ParentCateList)

        },
        // 当级联选择器的选择项发生变化 触发
        parentCateChange() {
            // console.log(this.selectedKeys)
            //  判断selectedKeys的长度，如果等于0 就是当前添加的是1级分类
            // 大于0 的话就是添加的是二级或3级分类   
            if (this.selectedKeys.length > 0) {
                //数组中最后一个就是它 父级的 ID 
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
                // 分类等级和数组长度对应 0 => 1级分类； 1 => 2级分类；2 => 3级分类
                this.addCateForm.cat_level = this.selectedKeys.length;
            } else {
                // 1级分类  父类id和自己的等级都为0
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        },
        // 添加分类 点击确定
        addCate() {
            //预校验表单
            this.$refs.addCateFormRef.validate(async val => {
                if (!val) return
                // console.log(this.addCateForm)
                // 发起请求
                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) return this.$message.error('添加失败')

                this.$message.success('添加成功')
                this.getCateList();
                this.showAddCateDialog = false;
            })

        },
        // 监听添加分类对话框的关闭事件
        addCateDialogClosed() {
            // 关闭对话框，重置表单
            this.$refs.addCateFormRef.resetFields();
            // 级联选择器里的数据 清空
            this.selectedKeys = [];
            this.addCateForm.cat_pid = 0;
            this.addCateForm.cat_level = 0;

        },
        // 编辑按钮
        async showEditCateFrom(id) {
            // 显示编辑分类对话框
            this.elitdialogVisible = true;
            // console.log(id)
            // 根据id 查询需要编辑的分类数据
            const { data: res } = await this.$http.get('categories/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询分类失败')
            this.editCateForm = res.data;
        },
        // 监听编辑分类对话框关闭
        elitDialogClosed() {
            this.$refs.editFormRef.resetFields();
            // this.editCateForm = [];
        },
        // 监听编辑分类对话框 确定按钮
        editCate() {
            this.$refs.editFormRef.validate(async val => {
                if (!val) return
                // 发起请求
                // console.log(this.editCateForm.cat_id)
                const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, this.editCateForm)
                if (res.meta.status !== 200) return this.$message.error('编辑失败')
                // console.log(res)
                this.$message.success('编辑成功')
                // 更新数据
                this.getCateList();
                // 关闭表单
                this.elitdialogVisible = false;
            })
        },
        // 删除分类 按钮
        async deleteCate(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 判断是否点击了确定
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // 确定删除  发起请求
            const {data:res} = await this.$http.delete('categories/' + id)
            if(res.meta.status !== 200) return this.$message.error('删除失败')
          
            this.$message.success('删除成功')
            // 更新数据
            this.getCateList()
        },


    }
}

</script>
<style  scoped>
.zk-table {
    margin-top: 15px;
}

.el-cascader {
    width: 100%;
}
</style>