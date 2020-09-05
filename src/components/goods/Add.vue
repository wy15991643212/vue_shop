<template>
  <div>
    <!--顶部面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/ome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--alert 区域-->
      <el-alert title="添加商品信息" type="info" center :closable="false" show-icon>
      </el-alert>
      <!--步骤条区域-->
      <!--  + activeIndex 或者 activeIndex - 0  将字符串的index 转为数字（和底下tabs 共用activeIndex）-->
      <el-steps :space="200" :active="+ activeIndex" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--整体form表单-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position='top'>
        <!--tabs 区域-->
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTableLeave" @tab-click='tabClicked'>
          <el-tab-pane label="基本信息" name='0'>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type='number'></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type='number'></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type='number'></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name='1'>
            <!--渲染表单的item项-->
            <el-form-item :label="item.attr_name" v-for="item in manyData" :key="item.attr_id">
              <!--复选框-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,index) in item.attr_vals" :key="index" border size='small'></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name='2'>
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name='3'>
            <!--action表示图片上传到后台的地址-->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success='handleSuccess'>
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name='4'>
            <!--富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>
            <!--添加按钮-->
            <el-button type="primary" class="btnAdd" @click="addGoodsBtn">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览-->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
export default {
  name: 'add',
  data() {
    return {
      activeIndex: '0',
      // form 表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        // 所选中的商品分类数组
        goods_cat: [],
        // 上传图片的临时路径
        pics: [],
        // 商品详情描述
        goods_introduce:'',
        attrs:[]
      },
      // form 表单验证规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 所有商品分类数据
      cateList: [],
      // 级联选择器props
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表
      manyData: [],
      // 静态属性列表
      onlyData: [],
      // 上传图片的后台地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传的请求头token
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览对话框是否显示
      previewVisible:false,
      // 图片预览的路径
      previewPath:'',
    };
  },
  created() {
    this.getCateList()
  },
  computed: {
    // cateId 当前选中的三级分类的 id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    // 获取所有商品分类
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error("获取商品分类失败")
      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择器 选中项变化时候触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        // 选中的不是3级分类
        this.addForm.goods_cat = []
      }
      console.log(this.addForm.goods_cat)
    },
    // 切换tab 时候触发
    beforeTableLeave(activeName, oldActiveName) {
      // 如果级联选择器没选中3级分类，则不被允许跳转到下一页
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 点击tab标签时候触发
    async tabClicked() {
      // console.log(this.activeIndex)
      // 判断进入的是否为商品参数页面
      if (this.activeIndex === '1') {
        // 发起网络请求
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')

        res.data.forEach(item => {
          // 把attr_vals 转为数组
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        });
        this.manyData = res.data;
        console.log(res)
      } else if (this.activeIndex === '2') {
        // 发起网络请求
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取静态属性失败')
        this.onlyData = res.data;
        console.log(res)
      }
    },
    // 处理移除图片事件
    handleRemove(file, fileList) {
      // console.log(file, fileList);
      // 1.获得将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从pics数组中，找到这个图片对应的索引值。
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      //  3.使用splice方法，把图片信息对象移除
      this.addForm.pics.splice(index, 1);
      console.log(this.addForm.pics)
    },
    // 处理图片预览事件
    handlePreview(file) {
      console.log(file);
      // 拿到图片的url
      this.previewPath = file.response.data.url;
      console.log(this.previewPath)
      // 给预览图片对话框中的图片地址赋值，并显示预览图片对话框
      this.previewVisible = true;
    },
    // 图片上传成功的钩子函数
    handleSuccess(response) {
      // console.log(response)
      // 1.拼接得到一个图片信息对象    {"pic":"/tmp_uploads/30f08d52c551ecb447277eae232304b8"}
      const picInfo = { pic: response.data.tmp_path }
      // 把拼接好的pic 对象push 到addForm的pic数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm.pics)
    },
    // 添加商品按钮
    addGoodsBtn(){
      // console.log(this.addForm.goods_introduce)
      // 表单预验证
      this.$refs.addFormRef.validate(async val =>{
        if(!val) return this.$message.error("请填写必要的表单项")
        // 预验证通过  发起网络请求
        // 把goods_cat的数组转为字符串
        // 深拷贝addForm 到form  
        const form = _.cloneDeep(this.addForm);
        // 把goods_cat转为字符串
        form.goods_cat = form.goods_cat.join(',');
        // 处理动态参数
        this.manyData.forEach(item => {
          const newInfo = {
            // 这里的item.attr_vals是数组，要转成字符串
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyData.forEach(item => {
          const newInfo = {
            attr_id:item.attr_id,
            attr_value:item.attr_vals,
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs;
        console.log(form);
        const {data:res} = await this.$http.post('goods',form)
        if(res.meta.status !== 201) return this.$message.error('添加商品失败')
        console.log(res)
        this.$message.success("添加商品成功")
        // 添加成功，跳转到商品列表页面
        this.$router.push('/goods')
      })
    },
  }
}

</script>
<style lang='less' scoped>
.el-checkbox {
  margin: 0 10px 0 0;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>