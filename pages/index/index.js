// index.js
// 获取应用实例
const app = getApp()
const systemInfo = wx.getSystemInfoSync()

function debounce(func, wait, immediate) {
  var timeout
  return function() {
    var context = this, args = arguments
    var later = function() {
      timeout = null
      if(!immediate) func.apply(context, args)
    }
    clearInterval(timeout)
    timeout = setTimeout(later, wait)
    if(immediate) func.apply(context, args)
  }
}

Page({
  data: {
    list: [],
    activeIndex: 0,
    leftTop: 0,
    viewId: null,
    leftItemHeight: 0,
    rightItemHeightList: [],
    systemInfo,
  },
  onLoad() {
    this.getData(() => {
      this.calcScrollHeight()
    })
  },
  onReady() {
    
  },
  getData(cb) {
    const _this = this
    wx.request({
      url: 'http://mock.app/ajax/category/get',
      dataType: 'json',
      success(res) {
        console.log(res)
        _this.setData({
          list: res.data
        }, () => {
          typeof cb === 'function' && cb()
        })
      }
    })
  },
  jumpTo(e) {
    let { id, index } = e.currentTarget.dataset
    if(index === this.data.activeIndex) {
      return
    }
    // 用来标记控制不执行右侧scroll-view滚动事件的逻辑
    // this.noScroll = true
    this.setData({
      viewId: 'scroll-' + id,
      activeIndex: index
    })
    this.calcScrollLeft(index)
  },
  getSelectorQuery() {
    return wx.createSelectorQuery().in(this)
  },
  // 计算滚动内容动态高度
  calcScrollHeight() {
    // 获得左侧分类，单个项高度
    this.getSelectorQuery().select('.left-item').boundingClientRect(res => {
      this.setData({
        leftItemHeight: res.height
      })
    }).exec()
    // 获得右侧每个分类内容块的高度
    this.getSelectorQuery().selectAll('.right-item-w').boundingClientRect(res => {
      this.setData({
        rightItemHeightList: res.map(v => v.height)
      })
    }).exec()
  },
  // 计算左边选中项距离顶部的距离
  calcScrollLeft(index) {
    let { leftItemHeight } = this.data
    // 左侧滚动居中，滚动内容的高度 - 可视窗口的高度/2 + 一个分类的高度/2
    let leftTop = index * leftItemHeight - (systemInfo.windowHeight-leftItemHeight) / 2
    this.setData({
      leftTop
    })
    // 要延迟设为 false， 监听的scroll事件执行在setDate回调之后
    // setTimeout(() => {
    //   this.noScroll = false
    // }, 666)
  },
  // 右侧内容滚动，与左侧分类菜单做关联
  scrollRight: debounce(function(e) {
    // if(this.noScroll) return
    let { scrollTop } = e.detail
    console.log('scrollTop', scrollTop)
    let { rightItemHeightList } = this.data
    // todo: 判断点击左侧菜单，不触发右侧滚动逻辑
    let activeIndex = 0
    let rightHeight = 0
    //  计算 scrollTop 的高度落在那个区间
    rightItemHeightList.forEach((item, index) => {
      rightHeight += item
      // 要加等于判断 左侧菜单点击跳转对应分类 scroll-into-view 触发 scroll事件
      // 得到的 activeIndex 与计算的 index 相等，不会再次出现右侧再次滚动，计算的index与activeIndex不等的问题
      if(rightHeight <= scrollTop) {
        activeIndex = index+1
        return false
      }
    })
    this.setData({
      activeIndex
    })
    this.calcScrollLeft(activeIndex)
  }, 60),
  debounce(func, wait, immediate) {
    var timeout
    return function() {
      var context = this, args = arguments
      var later = function() {
        timeout = null
        if(!immediate) func.apply(context, args)
      }
      clearInterval(timeout)
      timeout = setTimeout(later, wait)
      if(immediate) func.apply(context, args)
    }
  }
})