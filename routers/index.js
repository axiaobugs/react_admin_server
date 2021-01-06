/*
用来定义路由的路由器模块
 */
const express = require('express')
const md5 = require('blueimp-md5')

const UserModel = require('../models/UserModel')
const CategoryModel = require('../models/CategoryModel')
const OrderModel = require('../models/orderModel')
const RoleModel = require('../models/RoleModel')


// 得到路由器对象
const router = express.Router()
// console.log('router', router)

// 指定需要过滤的属性
const filter = {password: 0, __v: 0}


// 登陆
router.post('/login', (req, res) => {
  const {username, password} = req.body
  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
  UserModel.findOne({username, password: md5(password)})
    .then(user => {
      console.log('登陆链接请求');
      if (user) { // 登陆成功
        // 生成一个cookie(userid: user._id), 并交给浏览器保存
        res.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24})
        if (user.role_id) {
          RoleModel.findOne({_id: user.role_id})
            .then(role => {
              user._doc.role = role
              console.log('role user', user)
              res.send({status: 0, data: user})
            })
        } else {
          user._doc.role = {menus: []}
          // 返回登陆成功信息(包含user)
          res.send({status: 0, data: user})
        }

      } else {// 登陆失败
        res.send({status: 1, msg: '用户名或密码不正确!'})
      }
    })
    .catch(error => {
      console.error('登陆异常', error)
      res.send({status: 1, msg: '登陆异常, 请重新尝试'})
    })
})


// 添加订单
router.post('/manage/order/add', (req, res) => {
  const order = req.body
  console.log(order);
  OrderModel.create(order)
    .then(order => {
      res.send({status: 0, data: order})
    })
    .catch(error => {
      console.error('添加产品异常', error)
      res.send({status: 1, msg: '添加产品异常, 请重新尝试'})
    })
})

// 获取订单分页列表
router.get('/manage/order/list', (req, res) => {
  const {pageNum, pageSize,index} = req.query
  if(index*1===0){
    OrderModel.find({status:0})
    .then(orders => {
          res.send({status: 0, data: pageFilter(orders, pageNum, pageSize)})
        })
    
        .catch(error => {
          console.error('获取订单列表异常', error)
          res.send({status: 1, msg: '获取订单列表异常, 请重新尝试'})
        })
  }else if(index*1===1){
    OrderModel.find({status:2})
    .then(orders => {
      res.send({status: 0, data: pageFilter(orders, pageNum, pageSize)})
    })

    .catch(error => {
      console.error('获取订单列表异常', error)
      res.send({status: 1, msg: '获取订单列表异常, 请重新尝试'})
    })
  }else{
    console.log('分页获取失败');
  }
  })

// 订单列表完成(设置status字段为3(完成状态)并且设置dispatchDate字段为当前时间戳)
router.get('/manage/order/set', (req, res) => {
  const {areaId,orderNum,status} = req.query
  console.log(req.query);
  const dispatchDate = Date.now()
  if(status*1===0){
    OrderModel.update({areaId:areaId,orderNum:orderNum},{$set:{status:2,dispatchDate:dispatchDate}})
    .then(order => {
      console.log('订单'+areaId+orderNum+'更新完成');
      res.send({status: 0, msg: '订单'+areaId+orderNum+'更新完成'})
    })
    .catch(error => {
      console.error('提交完成订单失败', error)
      res.send({status: 1, msg: '提交完成订单失败, 请重新尝试'})
    })
  }else if(status*1===1){
    OrderModel.remove({areaId:areaId,orderNum:orderNum})
    .then(order => {
      console.log('订单'+areaId+orderNum+'删除完成');
      res.send({status: 0, msg: '订单'+areaId+orderNum+'删除完成'})
    })
    .catch(error => {
      console.error('提交完成订单失败', error)
      res.send({status: 1, msg: '提交完成订单失败, 请重新尝试'})
    })
  }
})

// 搜索获取订单已经存在订单所有数据   
// TODO: 以后新增订单时查看重复订单也可以使用该接口
router.get('/manage/order/search', (req, res) => {
  const {areaId,orderNum} = req.query
//   console.log(areaId,orderNum)
  OrderModel.find({areaId: areaId,orderNum:orderNum})
    .then(order=> {
//       console.log(order);
      res.send({status: 0,order:order})
    })
    .catch(error => {
      console.error('更新商品异常', error)
      res.send({status: 1, msg: '更新商品名称异常, 请重新尝试'})
    })
})
// 更新订单
router.post('/manage/order/update', (req, res) => {
  const order = req.body
  OrderModel.findOneAndUpdate({areaId:order.areaId,orderNum:order.orderNum}, order)
    .then(order=> {
      console.log(order.areaId+order.orderId+'订单更新');
      res.send({status: 0})
    })
    .catch(error => {
      console.error('更新商品异常', error)
      res.send({status: 1, msg: '更新商品名称异常, 请重新尝试'})
    })
})

// 更新产品状态(制造中/待发货)  TODO: 当所有工序完成后更改状态
router.get('/manage/order/status', (req, res) => {
  const {productId} = req.query
  OrderModel.find({_id: productId})
    .then(order => {
      res.send({status: 0, data:order})
    })
    .catch(error => {
      console.error('更新产品状态异常', error)
      res.send({status: 1, msg: '更新产品状态异常, 请重新尝试'})
    })
})


// // 添加角色
// router.post('/manage/role/add', (req, res) => {
//   const {roleName} = req.body
//   RoleModel.create({name: roleName})
//     .then(role => {
//       res.send({status: 0, data: role})
//     })
//     .catch(error => {
//       console.error('添加角色异常', error)
//       res.send({status: 1, msg: '添加角色异常, 请重新尝试'})
//     })
// })

// // 获取角色列表
// router.get('/manage/role/list', (req, res) => {
//   RoleModel.find()
//     .then(roles => {
//       res.send({status: 0, data: roles})
//     })
//     .catch(error => {
//       console.error('获取角色列表异常', error)
//       res.send({status: 1, msg: '获取角色列表异常, 请重新尝试'})
//     })
// })

// // 更新角色(设置权限)
// router.post('/manage/role/update', (req, res) => {
//   const role = req.body
//   role.auth_time = Date.now()
//   RoleModel.findOneAndUpdate({_id: role._id}, role)
//     .then(oldRole => {
//       // console.log('---', oldRole._doc)
//       res.send({status: 0, data: {...oldRole._doc, ...role}})
//     })
//     .catch(error => {
//       console.error('更新角色异常', error)
//       res.send({status: 1, msg: '更新角色异常, 请重新尝试'})
//     })
// })


/*
得到指定数组的分页信息对象
 */
function pageFilter(arr, pageNum, pageSize) {
  pageNum = pageNum * 1
  pageSize = pageSize * 1
  const total = arr.length
  const pages = Math.ceil(total / pageSize)
  const start = pageSize * (pageNum - 1)
  const end = start + pageSize <= total ? start + pageSize : total
  const list = []
  for (var i = start; i < end; i++) {
    list.push(arr[i])
  }

  return {
    pageNum,
    total,
    pages,
    pageSize,
    list
  }
}

require('./file-upload')(router)

module.exports = router
