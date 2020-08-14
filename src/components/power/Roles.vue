<template>
    <div>
        <!--顶部面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <!--添加按钮-->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddForm = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!--角色列表区域-->
            <el-table :data="rolesList" border stripe>
                <!--展开列-->
                <el-table-column type="expand">
                    <template slot-scope='scope'>
                        <!--遍历权限数据  scope.row -->
                        <el-row v-for="(item1, index1) in scope.row.children" :key="item1.id" :class="['bdbottom', index1 == 0 ? 'bdtop' : '','vcenter']">
                            <!--一级权限-->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--二级和三级权限-->
                            <el-col :span="19">
                                <el-row v-for="(item2, index2) in item1.children" :key="item2.id" :class="[index2 == 0 ? '' : 'bdtop','vcenter']">
                                    <el-col :span="6">
                                        <el-tag closable type="success" @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                    </el-col>
                                    <!--三级权限-->
                                    <el-col :span="18">
                                        <el-tag v-for="(item3 ,index3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!--索引列-->
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300">
                    <template slot-scope='scope'>
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editForm(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoles(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--添加角色对话框-->
            <el-dialog title="添加角色" :visible.sync="showAddForm" width="50%" @close='addRolesClose'>
                <el-form :model="addRolesForm" :rules="addRolesFormRules" ref="addRolesFormRef">
                    <el-form-item label="角色名称" label-width="100px" prop="roleName">
                        <el-input v-model="addRolesForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" label-width="100px" prop="roleDesc">
                        <el-input v-model="addRolesForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showAddForm = false">取 消</el-button>
                    <el-button type="primary" @click="addRoles">确 定</el-button>
                </span>
            </el-dialog>
            <!--修改角色对话框-->
            <el-dialog title="修改角色" :visible.sync="showEditForm" width="50%" @close='editRolesClose'>
                <el-form :model="editRolesForm" :rules="addRolesFormRules" ref="editRolesFormRef">
                    <!--<el-form-item label="角色id" label-width="100px">
                                                        <el-input v-model="editRolesForm.roleId" disabled></el-input>
                                                    </el-form-item>-->
                    <el-form-item label="角色名称" label-width="100px" prop="roleName">
                        <el-input v-model="editRolesForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" label-width="100px" prop="roleDesc">
                        <el-input v-model="editRolesForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showEditForm = false">取 消</el-button>
                    <el-button type="primary" @click="editRoles">确 定</el-button>
                </span>
            </el-dialog>
            <!--分配角色对话框-->
            <el-dialog title="分配角色" :visible.sync="showSetDialogVisible" width="50%" @close='setRirhtClosed'>
                <!--树形控件-->
                <el-tree :data="rightsList" show-checkbox :props="treeProps" default-expand-all node-key='id' :default-checked-keys='defKeys' ref="treeRef">
                </el-tree>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="showSetDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="allotRights">确 定</el-button>
                </span>
            </el-dialog>

        </el-card>
    </div>
</template>

<script>
export default {
    name: 'roles',
    data() {
        return {
            // 所有角色列表数据
            rolesList: [],
            //所有权限树形结构数据
            rightsList: [],
            addRolesForm: {
                roleName: '',
                roleDesc: ''
            },
            // 修改角色 表单
            editRolesForm: {
                roleName: '',
                roleDesc: ''
            },
            // 是否显示添加角色对话框
            showAddForm: false,
            // 是否显示修改角色对话框
            showEditForm: false,
            // 是否显示分配角色对话框
            showSetDialogVisible: false,
            //添加角色验证规则
            addRolesFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' }
                ],
            },
            // 树形控件属性绑定对象
            treeProps: {
                children: 'children',
                label: 'authName'
            },
            // 默认选中的节点
            defKeys:[],
            // 当前待分配角色的id
            roleId:''
        };
    },
    created() {
        this.getRolesList();
    },
    methods: {
        async getRolesList() {
            const { data: res } = await this.$http.get('roles');
            if (res.meta.status !== 200) return this.$message.error('获取失败');
            // console.log(res)
            this.rolesList = res.data;
        },
        // 添加角色 
        addRoles() {
            // 先对表单预校验，通过后再发送网络请求
            this.$refs.addRolesFormRef.validate(async val => {
                if (!val) return
                // 通过预校验
                const { data: res } = await this.$http.post('roles', this.addRolesForm)
                if (res.meta.status !== 201) return this.$message.error("添加失败")
                //    console.log(res)
                this.$message.success("添加成功");
                // 重新获取数据
                this.getRolesList();

                this.showAddForm = false;

            })
        },
        // 关闭添加角色的对话框
        addRolesClose() {
            // 重置表单
            this.$refs.addRolesFormRef.resetFields();
        },
        // 关闭修改角色的对话框
        editRolesClose() {
            // 重置表单
            this.$refs.editRolesFormRef.resetFields();
        },
        // 关闭分配权限对话框
        setRirhtClosed(){
            // 清空权限列表里的数据
            this.defKeys = []
        },
        // 查询修改用户
        async editForm(id) {
            // 根据id 修改对应的数据
            const { data: res } = await this.$http.get("roles/" + id)
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error("获取当前用户信息失败")
            this.editRolesForm = res.data;
            this.showEditForm = true;
        },
        // 修改角色
        editRoles() {
            this.$refs.editRolesFormRef.validate(async val => {
                if (!val) return
                // 通过预校验
                // console.log(this.editRolesForm.roleId)
                const { data: res } = await this.$http.put('roles/' + this.editRolesForm.roleId, this.editRolesForm)
                if (res.meta.status !== 200) return this.$message.error("修改失败")
                //    console.log(res)
                this.$message.success("修改成功");
                // 重新获取数据
                this.getRolesList();
                // 关闭修改表单
                this.showEditForm = false;
            })
        },
        // 监听删除用户按钮
        async deleteRoles(id) {
            const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            //  点击确定 返回字符串 confirm  点击取消返回字符串 cancel
            // console.log(confirmRes)
            // 判断用户是否真正删除
            if (confirmRes !== "confirm") return this.$message.info('已取消删除')
            // 真的删除
            const { data: res } = await this.$http.delete("roles/" + id)
            // console.log(res)
            if (res.meta.status !== 200) return this.$message.error('删除失败！')
            // 成功
            this.$message.success("删除成功");
            // 重新获取用户列表
            this.getRolesList();
        },
        //根据id删除对应的权限
        async removeRightById(role, rightId) {
            const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 判断是否点击了确定
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // 点击了确定  发起请求
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error('删除失败')

            // 这里不建议重新获取数据，因为会发生页面的重新渲染，导致权限页需要重新打开
            // this.getRolesList();

            // 直接把服务器返回最新的权限赋值给当前角色的children     role 就是上面的 scope.row 获取到的
            role.children = res.data;
            this.$message.success('删除成功')

        },
        // 显示分配角色对话框
        async showSetRoleDialog(role) {
            // 拿到当前角色的id 保存到data中，为分配角色使用
            this.roleId = role.id
            // 获取到所有的权限数据  树形结构
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) return this.$message.error("获取权限数据失败")
            this.rightsList = res.data;
            // console.log(this.rightsList)
            // 获取到所有三级节点的 id  保存到defKeys 数组中
            this.getLeafKeys(role, this.defKeys)
            this.showSetDialogVisible = true;
        },
        //通过递归的形式，获取到角色下所有三级权限的id，保存到defKeys 数组中
        getLeafKeys(node , arr){
            // 如果当前节点不包含 children 属性，则为三级节点
            if(! node.children){
                return arr.push(node.id)
            }
            // 如果有， 递归
            node.children.forEach(item => this.getLeafKeys(item, arr))
        },
        // 分配权限
        async allotRights(){
            // 拿到当前树型控件选中和半选中的 id  接口要求所有半选中和选中的节点的 id
            // getHalfCheckedKeys返回目前半选中的节点的 key 所组成的数组
            // getCheckedKeys返回目前被选中的节点的 key 所组成的数组
            const keys = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
            // 按接口要求转成字符串，并以,分割
            const idStr = keys.join(',')
            // console.log(idStr)
            const { data:res } = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
            if(res.meta.status !== 200) return this.$message.error("分配权限失败")
            this.$message.success("分配权限成功")
            // 更新权限列表
            this.getRolesList();
            // 关闭分配权限对话框
            this.showSetDialogVisible = false;
        }
    }
}

</script>
<style lang='less' scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}
</style>