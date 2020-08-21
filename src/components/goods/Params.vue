<template>
    <div>
        <!--顶部面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <!--警告区域-->
            <el-alert title="注意：只允许为三级分类设置相关参数！" type="warning" show-icon :closable='false'>
            </el-alert>
            <!--选择商品分类区域-->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!--选择商品分类的级联选择框-->
                    <el-cascader v-model="selectCate" :options="cateList" :props="paramsProps" @change="handleChange"></el-cascader>
                </el-col>
            </el-row>
            <!--tab切换区域-->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <!--添加动态参数面板-->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="showAddDialog">添加参数</el-button>
                    <!--动态参数表格-->
                    <el-table :data="manyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand">
                            <!--循环渲染tag标签-->
                            <template slot-scope='scope'>
                                <el-tag closable v-for="(item,index) in scope.row.attr_vals" :key="index" @close='handleClose(index,scope.row)'>{{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!--索引列-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope='scope'>
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click='deleteParams(scope.row.attr_id)'>删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!--添加静态属性面板-->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="showAddDialog">添加参数</el-button>
                    <!--静态属性表格-->
                    <el-table :data="onlyTableData" border stripe>
                        <!--展开行-->
                        <el-table-column type="expand">
                            <!--循环渲染tag标签-->
                            <template slot-scope='scope'>
                                <el-tag closable v-for="(item,index) in scope.row.attr_vals" :key="index" @close='handleClose(index,scope.row)'>{{item}}</el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!--索引列-->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="属性名称"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope='scope'>
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click='deleteParams(scope.row.attr_id)'>删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
            <!--添加参数对话框-->
            <el-dialog :title="'添加' + titleText" :visible.sync="addDialog" width="50%" @close='addFormClosed'>
                <!--添加参数 表单-->
                <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                    <el-form-item :label="titleText" prop="attr_name">
                        <el-input v-model="addForm.attr_name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialog = false">取 消</el-button>
                    <el-button type="primary" @click="addParams">确 定</el-button>
                </span>
            </el-dialog>
            <!--修改参数对话框-->
            <el-dialog :title="'修改' + titleText" :visible.sync="editDialog" width="50%" @close='editFormClosed'>
                <!--添加参数 表单-->
                <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                    <el-form-item :label="titleText" prop="attr_name">
                        <el-input v-model="editForm.attr_name"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialog = false">取 消</el-button>
                    <el-button type="primary" @click="editParams">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'params',
    data() {
        return {
            // 所有商品列表
            cateList: [],
            // 级联选择框选中分类的ID
            selectCate: [],
            paramsProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                expandTrigger: 'hover'
            },
            // tab默认展示的
            activeName: 'many',
            // 动态参数 数据
            manyTableData: [],
            // 静态属性 数据
            onlyTableData: [],
            // 添加参数对话框是否显示
            addDialog: false,
            // 添加参数表单绑定数据
            addForm: {
                attr_name: ''
            },
            // 添加参数 表单验证规则
            addFormRules: {
                attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
            },
            // 修改参数对话框是否显示
            editDialog: false,
            // 修改参数绑定数据
            editForm: {},
            // 修改参数对话框  表单验证规则
            editFormRules: {
                attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
            },
        };
    },
    created() {
        this.getCatList()
    },
    computed: {
        // 是三级分类 就显示按钮，不是就禁用
        isBtnDisable() {
            if (this.selectCate.length !== 3) {
                return true
            }
            return false
        },
        // cateId 当前选中的三级分类的 id
        cateId() {
            if (this.selectCate.length === 3) {
                return this.selectCate[2]
            }
            return null
        },
        // 添加参数对话框 标题
        titleText() {
            if (this.activeName === 'many') {
                return "动态参数"
            } else {
                return "静态属性"
            }
        }
    },
    methods: {
        // 获取所有商品分类
        async getCatList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
            this.cateList = res.data;
            // console.log(this.cateList)
        },
        // 级联选择框选中项变化会触发
        handleChange() {
            this.getParamsData()
        },
        //点击tab 标签事件
        handleClick() {
            console.log(this.activeName)
            this.getParamsData()
        },
        // 获取参数的列表数据
        async getParamsData() {
            // 选中的不是3级分类
            if (this.selectCate.length !== 3) {
                this.selectCate = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            // 选中的是3级分类
            console.log(this.selectCate)
            // 发起网络请求
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
            // 拿到数据后，对里面的attr_vals的字符串转化成数组（用于渲染展开行的tag标签）
            res.data.forEach(item => {
                // 判断item.attr_vals 是否为空(为空的话会在展开行渲染一个没有内容的tag标签),
                // 为空的话把数组重置成 [](解决问题)
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [];

                // 为展开行数据添加 是否显示input  和 input所绑定的数据  属性
                // 是否显示input
                item.inputVisible = false
                // 展开行 input 绑定的数据
                item.inputValue = ''
            })
            console.log(res.data)
            // 判断获取到的数据到底是 动态参数还是静态属性  
            if (this.activeName === 'many') {
                // 动态参数 数据
                this.manyTableData = res.data
            } else {
                // 静态属性  数据
                this.onlyTableData = res.data
            }

        },
        // 点击显示添加参数对话框
        showAddDialog() {
            this.addDialog = true
        },
        // 添加参数对话框关闭
        addFormClosed() {
            // 对话框关闭  重置表单   resetFields  要加s  官方的是resetField 会报错
            this.$refs.addFormRef.resetFields()
        },
        // 添加参数按钮
        addParams() {
            // 表单预验证
            this.$refs.addFormRef.validate(async val => {
                if (!val) return
                // 预验证通过 发起请求
                const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 201) return this.$message.error('添加参数失败')
                this.$message.success("添加参数成功");
                // 重新获取列表数据
                this.getParamsData()
                this.addDialog = false
            })
        },
        // 修改参数对话框关闭事件
        editFormClosed() {
            // 重置表单
            this.$refs.editFormRef.resetFields();
        },
        // 点击显示修改参数对话框
        async showEditDialog(attr_id) {
            // 根据id 查询参数 categories/:id(当前所属3级分类的id)/attributes/:attrId(3级分类下 当前属性的id)
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, { params: { attr_sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error("查询参数失败")
            this.editForm = res.data;
            // console.log(res.data)
            this.editDialog = true;
        },
        // 修改参数 对话框  确定按钮
        editParams() {
            this.$refs.editFormRef.validate(async val => {
                // 表单预校验
                if (!val) return
                // 发起请求
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_sel: this.activeName, attr_name: this.editForm.attr_name })
                if (res.meta.status !== 200) return this.$message.error('修改参数失败')
                // 更新列表
                this.getParamsData()
                // 关闭修改表单
                this.editDialog = false
                this.$message.success('修改参数成功')
            })
        },
        // 删除参数
        async deleteParams(attr_id) {
            // 点击的弹框
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 判断是否点击了确定
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // 确定删除  发起请求
            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
            if (res.meta.status !== 200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getParamsData()
        },
        // 展开行input 失去焦点，或者按下回车 事件
        handleInputConfirm(row) {
            // 判断文本框里的内容是否为空
            if(row.inputValue.trim().length === 0){
                // 用户输入了空  或者没输入
                 row.inputValue = '';
                 row.inputVisible = false;
                 return
            }
            // 输入不为空
            row.attr_vals.push(row.inputValue.trim());
            row.inputValue = '';
            row.inputVisible = false;
            // 发起网络请求，保存这次操作
            this.saveAttrVals(row);
        },
        //   显示 展开行 input
        showInput(row) {
            row.inputVisible = true;
            // $nextTick 作用是  当页面上的元素被重新渲染后，才会执行回调函数中的代码(避免input还没被渲染出来就执行回调函数)
            this.$nextTick(_ => {
                // 让input 获取焦点
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        //  删除tag标签
        handleClose(index,row) {
            row.attr_vals.splice(row.attr_vals.indexOf(index), 1);
             // 发起网络请求，保存这次操作
           this.saveAttrVals(row);
        },
        // 将对attr_vals 的操作，保存到数据库
        async saveAttrVals(row){
             const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                // 服务器上attr_vals 是字符串格式的。
                attr_vals:row.attr_vals.join(',')
            })
            if(res.meta.status !== 200) return this.$message.error("修改参数项失败")
            
            this.$message.success("修改参数项成功")
        }
    }
}

</script>
<style  scoped>
.cat_opt {
    margin: 15px 0;
}

.el-tag {
    margin: 10px;
}
.el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 120px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>