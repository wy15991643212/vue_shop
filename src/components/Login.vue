<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像部分-->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 表单部分-->
      <el-form ref="loginFormRef" label-width="0" class="login_form" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <!-- 按钮-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>

      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      //表单的数据绑定对象
      loginForm:{
        username:'admin',
        password:'123456',
      },
      //表单的验证规则对象
      loginFormRules:{
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password:[
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  methods:{
    //表单重置
    resetForm(){
      this.$refs.loginFormRef.resetFields();
    },
    //表单预验证
    login(){
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid)
        // 判断验证是否通过
        if(!valid) return ;
        // 请求数据
       let { data:res } = await this.$http.post('login',this.loginForm);
      
       if(res.meta.status !== 200) return this.$message.error('登陆失败');
        this.$message.success('登录成功');
        //  console.log(res);
         const token = res.data.token;
        //将登陆成功的token 保存到sessionStorage 中
        window.sessionStorage.setItem('token',token);
        // 通过编程式导航，跳转到home页面
        this.$router.push('/home')
      })
    }
  }
}

</script>
<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
  position: relative;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #FFF;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}

.avater_box {
  width: 130px;
  height: 130px;
  background-color: #fff;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #DDD;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login_form{
  width: 100%;
  position: absolute;
  bottom:0;
  box-sizing: border-box;
  padding: 0 20px;
  .btns{
    display: flex;
    justify-content: flex-end;
  }
}

</style>



