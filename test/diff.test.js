import diff from '../src/diff.js'
import { expect } from 'chai'
const deepClone = o => JSON.parse(JSON.stringify(o));

describe("测试diff库对象", () => {
  it("测试空对象新增一个键值对", () => {
    let prev = {}
    let current = deepClone(prev)
    current.a = 1;
    expect(diff(current, prev)).to.be.deep.equal({
      a: 1
    });
  });

  it("测试空对象新增多个键值对", () => {
    let prev = {}
    let current = deepClone(prev)
    current.a = 1;
    current.b = 1;
    expect(diff(current, prev)).to.be.deep.equal({
      a: 1,
      b: 1
    });
  });

  it("测试修改键值对", () => {
    let prev = {
      a: 1
    }
    let current = deepClone(prev)
    current.a = 2;
    expect(diff(current, prev)).to.be.deep.equal({
      a: 2
    });
  });

  it("测试完全相同的两个对象", () => {
    let prev = {
      a: 1
    }
    let current = deepClone(prev)
    expect(diff(current, prev)).to.be.empty;
  });
  it("测试两个对象键值对都不同的情况", () => {
    let prev = {
      a: 1
    }
    let current = {
      b: 1
    }
    expect(diff(current, prev)).to.be.deep.equal({
      b: 1,
      a: null
    });
  });

  it("测试在非空对象上增加一个键值对", () => {
    var result = diff(
      {
        a: 1,
        b: 1
      },
      {
        a: 1
      }
    );
    expect(result).to.be.deep.equal({
      b: 1
    });
  });
});

describe("测试diff库数组", () => {
  it("测试两个相同的空数组", () => {
    var result = diff(
      {
        a: []
      },
      {
        a: []
      }
    );
    expect(result).to.be.empty;
  });
  it("测试在原数组基础上增加一个元素", () => {
    var prev = {
      a: []
    };
    var current = deepClone(prev);
    current.a.push(1);
    var result = diff(current, prev);
    expect(result).to.be.deep.equal({
      a: [1]
    });
  });

  it("测试在原数组基础上减少一个元素", () => {
    var prev = {
      a: [1, 2]
    };
    var current = deepClone(prev);
    current.a.splice(1, 1);
    var result = diff(current, prev);
    expect(result).to.be.deep.equal({
      a: [1]
    });
  });

  it("测试在原数组基础上改变一个元素", () => {
    var prev = {
      a: [1, 2]
    };
    var current = deepClone(prev);
    current.a[1] = 3;
    var result = diff(current, prev);
    expect(result).to.be.deep.equal({
      "a[1]": 3
    });
  });

  it("测试在原数组基础上改变几个元素又删几个元素", () => {
    var prev = {
      a: [1, 2, 3, 4]
    };
    var current = {
      a: [6, 3]
    };
    var result = diff(current, prev);
    expect(result).to.be.deep.equal({
      a: [6, 3]
    });
  });
  it("测试在原数组基础上增加几个元素", () => {
    var prev = {
      a: [1, 2]
    };
    var current = {
      a: [1, 2, 3, 4]
    };
    var result = diff(current, prev);
    expect(result).to.be.deep.equal({
      a: [1, 2, 3, 4]
    });
  });
});

describe("测试diff库数组对象", () => {
  it("测试改变一个数组内某元素的属性", () => {
    let prev = {
      list: [
        {
          id: 0,
          name: "张三"
        },
        {
          id: 1,
          name: "李四"
        }
      ]
    };
    let current = deepClone(prev);
    current.list[0].name = "王五";
    let result = diff(current, prev);
    expect(result).to.be.deep.equal({
      "list[0].name": "王五"
    });
  });
  it("测试增加一个对象", () => {
    let prev = {
      list: [
        {
          id: 0,
          name: "张三"
        }
      ]
    };
    let current = deepClone(prev);
    current.list.push({
      id: 1,
      name: "李四"
    });
    let result = diff(current, prev);
    expect(result).to.be.deep.equal({
      list: [
        {
          id: 0,
          name: "张三"
        },
        {
          id: 1,
          name: "李四"
        }
      ]
    });
  });

  it("测试删除一个对象", () => {
    let prev = {
      list: [
        {
          id: 0,
          name: "张三"
        },
        {
          id: 1,
          name: "李四"
        }
      ],
      
    };
    let current = deepClone(prev);
    current.list.pop();
    let result = diff(current, prev);
    expect(result).to.be.deep.equal({
      list: [
        {
          id: 0,
          name: "张三"
        }
      ]
    });
  });

  it("测试清空一个对象", () => {
    let prev = {
      list: [
        {
          id: 0,
          name: "张三"
        },
        {
          id: 1,
          name: "李四"
        }
      ],
    };
    let current = {
      list: []
    }
    let result = diff(current, prev);
    expect(result).to.be.deep.equal({
      list: []
    });
  });

  it("测试修改一个对象，且后置新增一个对象", () => {
    let prev = {
      list: [
        {
          id: 0,
          name: "张三"
        }
      ]
    };
    let current = deepClone(prev);
    current.list[0].name = '王五'
    current.list.push({
      id: 1,
      name: '李四'
    })
    let result = diff(current, prev);
    expect(result).to.be.deep.equal({
      list: [
        {
          id: 0,
          name: '王五'
        },
        {
          id: 1,
          name: '李四'
        }
      ]
    });
  });

  it("测试修改一个对象，且前置新增一个对象", () => {
    let prev = {
      list: [
        {
          id: 0,
          name: "张三"
        }
      ]
    };
    let current = deepClone(prev);
    current.list[0].name = '王五'
    current.list.unshift({
      id: 1,
      name: '李四'
    })
    let result = diff(current, prev);
    expect(result).to.be.deep.equal({
      list: [
        {
          id: 1,
          name: '李四'
        },
        {
          id: 0,
          name: '王五'
        }
      ]
    });
  });


});


describe('测试不同类型diff', () => {
  it('测试数字和字符串', () => {
    let prev = {
      a: 1
    }
    let current = {
      a: '1'
    }
    expect(diff(current, prev)).to.be.deep.equal({
      a: '1'
    })
  })
  it('测试原始类型和对象', () => {
    let prev = {
      a: 1
    }
    let current = {
      a: {}
    }
    expect(diff(current, prev)).to.be.deep.equal({
      a: {}
    })
    let prev1 = {
      a: 1
    }
    let current1 = {
      a: []
    }
    expect(diff(current1, prev1)).to.be.deep.equal({
      a: []
    })
  })
})