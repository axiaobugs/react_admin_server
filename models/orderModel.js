/*
能操作order集合数据的Model
 */
// 1.引入mongoose
const mongoose = require('mongoose')

// 2.字义Schema(描述文档结构)
const orderSchema = new mongoose.Schema({
  uploadList: {type: Array}, // n个图片文件名的json字符串
  areaId: {type: String, required: true}, // 所属分类的id
  orderNum: {type: String, required: true}, // 所属分类的父分类id
  category:{type:String,required:true},     // 产品分类
  cp: {type: Boolean, required: true,default:false},  //cp材料
  date: {type: Date, required: true}, // 截止日期
  editor: {type: String,default:[]},  //订单详细内同,html格式
  fp: {type: Boolean, required: true,default:false},  //平铝
  gasStrut: {type: String, required: true,default:'0'},  //撑杆数量
  install: {type: Boolean, required: true,default:false}, //是否安装
  installName: {type: String, required: true,default:'张辉'}, //安装工姓名
  lock:{type: String, required: true},  //锁的种类
  logo: {type: Boolean, required: true,default:false}, //是否有logo
  powder:{type: Boolean, required: true,default:false},//是否喷漆
  price:{type: String, required: true},  //价格
  quantity:{type: String, required: true},//数量
  thick:{type: String, required: true,default:'1.6mm'},//板厚
  tigName:{type: String, required: true,default:'张辉'},//tig焊工姓名
  weldName: {type: String, required: true,default:'张辉'}, // mig焊工姓名 
  cut: {type: Boolean,required: true,default:false},   //切板状态
  fold: {type: Boolean, required: true,default:false}, //折板状态
  weld: {type: Boolean, required: true,default:false}, //焊接状态
  fit: {type: Boolean, required: true,default:false},  //安装状态
  qc: {type: Boolean, required: true,default:false},   //之间状态
  dispatchDate:{type: Date,default:null}, // 实际出货日期
  status: {type: Number, default: 0}, // 订单状态: 0:未完成, 1: 准备发货 2:顾客签收,存档
})


// 3. 定义Model(与集合对应, 可以操作集合)
const OrderModel = mongoose.model('orders', orderSchema)

// 4. 向外暴露Model
module.exports = OrderModel
