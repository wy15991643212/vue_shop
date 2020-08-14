<template>
  <div>
    <!--顶部面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!-- 搜索与添加区域-->
      <el-row :gutter='30'>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域-->
      <el-table :data="userList" stripe border>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>

        </el-table-column>
        <el-table-column label="操作" width="190">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            <!--分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable='false'>
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoles(scope.row)"></el-button>
            </el-tooltip>

          </template>
        </el-table-column>
      </el-table>
      <!--分页功能-->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
      <!--添加用户对话框区域-->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close='addDialogClosed'>
        <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="100px">
          <!--用户名-->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addFrom.username"></el-input>
          </el-form-item>
          <!--密码-->
          <el-form-item label="密码" prop="password">
            <el-input v-model="addFrom.password"></el-input>
          </el-form-item>
          <!--邮箱-->
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addFrom.email"></el-input>
          </el-form-item>
          <!--电话-->
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addFrom.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改用户对话框区域-->
      <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close='editDialogClosed'>
        <el-form :rules="editFromRules" ref="editFromRef" :model="editFrom" label-width="100px">
          <!--用户名-->
          <el-form-item label="用户名">
            <el-input v-model="editFrom.username" disabled></el-input>
          </el-form-item>
          <!--邮箱-->
          <el-form-item label="邮箱" prop='email'>
            <el-input v-model="editFrom.email"></el-input>
          </el-form-item>
          <!--手机号-->
          <el-form-item label="手机号" prop='mobile'>
            <el-input v-model="editFrom.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!--分配角色对话框区域-->
      <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close='setRoleDialogClosed'>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
        <p></p>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'users',
  data() {
    // 校验邮箱
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb()
      }
      return cb(new Error("请输入合法的邮箱"))
    }
    // 校验手机号
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        //合法的手机号
        return cb()
      }
      return cb(new Error("请输入合法的手机号"))
    }
    return {
      queryInfo: {
        // 查询参数query
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 2
      },
      userList: [],
      total: 1,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 添加用户的表单信息
      addFrom: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单用户信息的校验规则
      addFromRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ],
      },
      // 修改用户 表单信息
      editFrom: {},
      // 修改用户 验证规则
      editFromRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 是否显示分配角色对话框
      setRoleDialogVisible: false,
      // 待分配角色的 用户信息
      userInfo: {},
      // 所有角色数据列表
      roleList: [],
      // 当前被选中的 角色 id
      selectedRoleId: ''

    };
  },
  created() {
    this.getUsersList();
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo });
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error("数据获取失败")
      this.userList = res.data.users;
      this.total = res.data.total;
      // console.log(this.userList)
      // console.log(this.total)
    },
    //每页显示多少数据
    handleSizeChange(val) {
      // 把修改过的每页显示多少数据，赋值给this.queryInfo.pagesize。
      this.queryInfo.pagesize = val;
      // 重新请求数据
      this.getUsersList();
    },
    // 当前是第几页
    handleCurrentChange(val) {

      this.queryInfo.pagenum = val;
      // 重新请求数据
      this.getUsersList();
    },
    // 用户状态的更新
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      // console.log(res)
      if (res.meta.status !== 200) {
        // 请求失败  状态更新失败了，应该先变成之前的状态
        userInfo.mg_state = !userInfo.mg_state;
        this.$message.error("用户状态更新失败！")
      }
      this.$message.success("用户状态更新成功！")
    },
    // 监听 添加用户对话框，表单关闭
    addDialogClosed() {
      //resetFields() 重置表单  官方文档上写的是resetField(少了个s)
      this.$refs.addFromRef.resetFields();
    },
    // 添加新用户
    addUser() {
      // 先对表单预校验，通过后再发送网络请求
      this.$refs.addFromRef.validate(async val => {
        // console.log(val)
        if (!val) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addFrom);
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        // 关闭添加用户对话框
        this.addDialogVisible = false
        // 重新获取一下用户列表
        this.getUsersList();


      })
    },
    // 显示修改用户信息对话框
    async showEditDialog(id) {
      // 通过scope.row.id  传过来的id 查询用户信息
      const { data: res } = await this.$http.get('users/' + id);
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败');
      // console.log(res)
      this.editFrom = res.data;
      this.editDialogVisible = true;
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      //resetFields() 重置表单
      this.$refs.editFromRef.resetFields();
    },
    // 修改用户信息
    editUserInfo() {
      this.$refs.editFromRef.validate(async val => {
        if (!val) return
        // 通过预验证，发送网络请求
        const { data: res } = await this.$http.put('users/' + this.editFrom.id, this.editFrom)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error("更新用户信息失败");
        // 成功
        this.$message.success("更新用户信息成功");
        // 重新获取用户列表
        this.getUsersList();
        //关闭对话框
        this.editDialogVisible = false;
      })
    },
    // 监听删除用户按钮
    async deleteUser(id) {
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
      const { data: res } = await this.$http.delete("users/" + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      // 成功
      this.$message.success("删除成功");
      // 重新获取用户列表
      this.getUsersList();
      //关闭对话框
      this.editDialogVisible = false;
    },
    // 显示分配角色对话框
    async setRoles(userInfo) {
      this.userInfo = userInfo;
      // console.log(userInfo)
      // 请求roles
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error("获取失败")
      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    // 点击确定按钮，分配角色
    async saveRoleInfo() {

      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error("分配角色失败")

      this.$message.success('分配角色成功')
      this.getUsersList()
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色 对话框关闭
    setRoleDialogClosed(){
      // 将用户信息和被选中的角色ID 重置为空
      this.userInfo = {};
      this.selectedRoleId = "";
    }
  }
}

</script>
<style lang="less" scoped>

</style>
