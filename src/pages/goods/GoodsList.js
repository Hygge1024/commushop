import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table, Input, Select, Button, Space, message, Tag, Modal, Form,
  InputNumber, Upload
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, PlusOutlined,
  UploadOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { goodsService } from '../../services/goodsService';
import { categoryService } from '../../services/categoryService';

const { Option } = Select;

const GoodsList = () => {
  const [loading, setLoading] = useState(false);// 加载状态，初始为 false
  const [data, setData] = useState([]);// 商品数据，初始为空数组
  const [categories, setCategories] = useState([]);// 商品分类，初始为空数组
  const [pagination, setPagination] = useState({
    current: 1,// 当前页码
    size: 10, // 每页显示的商品数量
    total: 0,// 商品总数
    pages: 1 // 总页数
  });
  const [searchParams, setSearchParams] = useState({
    productName: '',
    productType: '',
    minOriginalPrice: '',
    maxOriginalPrice: '',
    minGroupPrice: '',
    maxGroupPrice: '',
    categoryId: ''
  });
  const [isModalVisible, setIsModalVisible] = useState(false);// 模态框可见性，初始为 false
  const [form] = Form.useForm();// 创建 Ant Design 表单实例
  const [uploadFile, setUploadFile] = useState(null);// 上传文件，初始为 null
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [editFileList, setEditFileList] = useState([]);

  // 使用 useRef 来存储最新的 searchParams，避免闭包问题
  const searchParamsRef = useRef(searchParams);// 创建一个 ref 来存储 searchParams
  searchParamsRef.current = searchParams;// 更新 ref 的值为最新的 searchParams


  // 使用 useRef 来存储最新的 pagination，避免闭包问题
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const columns = [
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '商品描述',
      dataIndex: 'productDesc',
      key: 'productDesc',
    },
    {
      title: '商品原价(元)',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
    },
    {
      title: '团购价格(元)',
      dataIndex: 'groupPrice',
      key: 'groupPrice',
    },
    {
      title: '库存数量(个)',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
    },
    {
      title: '商品分类',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories) => (// 自定义渲染函数
        <>
          {categories?.map((category) => (
            <Tag color="blue" key={category.categoryId}>
              {category.categoryName}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '图片URL',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (text) => (
        text ? ( // 如果 text 存在
          <a href={text} target="_blank" rel="noopener noreferrer">
            <img
              src={text}
              alt="商品图片"
              style={{
                width: 50,
                height: 40,
                objectFit: 'cover',
                cursor: 'pointer',
                borderRadius: '8px' // 添加圆角样式
              }}
            />
          </a>
        ) : '暂无图片'
      ),
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size={4} style={{ display: 'flex', justifyContent: 'center' }}>
          <Button 
            type="link" 
            onClick={() => handleEdit(record)}
            style={{ padding: '4px 8px' }}
          >
            修改
          </Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleDelete(record)}
            style={{ padding: '4px 8px' }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const currentSearchParams = searchParamsRef.current;
      const currentPagination = paginationRef.current;

      // 发起 API 请求，获取商品列表数据
      const response = await goodsService.getGoodsList({
        current: params.current || currentPagination.current,//如果 params.current 不存在或为假值，则使用 currentPagination.current 作为默认值。
        size: params.pageSize || currentPagination.size,
        productName: currentSearchParams.productName,
        productType: currentSearchParams.productType,
        minOriginalPrice: currentSearchParams.minOriginalPrice,
        maxOriginalPrice: currentSearchParams.maxOriginalPrice,
        minGroupPrice: currentSearchParams.minGroupPrice,
        maxGroupPrice: currentSearchParams.maxGroupPrice,
        categoryId: currentSearchParams.categoryId
      });

      console.log('API Response:', response);

      // 处理分页数据
      if (response.data && response.data.records) {
        setData(response.data.records);
        setPagination(prev => ({
          ...prev,
          current: response.data.current,
          size: response.data.size,
          total: response.data.total,
          pages: response.data.pages
        }));
      } else {
        setData([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          pages: 0
        }));
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      message.error(error.message || '获取数据失败');
      setData([]);
    }
    setLoading(false);
  }, []);

  // 获取商品分类数据
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      message.error('获取商品分类失败');
      console.error('Failed to fetch categories:', error);
    }
  };

  // 在组件挂载时获取一次数据
  useEffect(() => {
    fetchData();// 调用 fetchData 函数获取数据
  }, [fetchData]);// 依赖项为 fetchData

  // 在组件挂载时获取分类数据
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = () => {
    fetchData({ current: 1 });
  };

  const handleReset = () => {
    setSearchParams({
      productName: '',
      productType: '',
      minOriginalPrice: '',
      maxOriginalPrice: '',
      minGroupPrice: '',
      maxGroupPrice: '',
      categoryId: ''
    });
    fetchData({ current: 1 });// 调用 fetchData 函数，并设置当前页码为 1
  };

  const handleEdit = (record) => {
    console.log('编辑的商品数据:', record);
    setCurrentProduct(record);
    // 设置表单的初始值
    form.setFieldsValue({
      productId: record.productId,
      productName: record.productName,
      productDesc: record.productDesc,
      originalPrice: record.originalPrice,
      groupPrice: record.groupPrice,
      stockQuantity: record.stockQuantity,
      categories: record.categories?.map(cat => cat.categoryId) || []
    });
    setEditModalVisible(true);
  };

  const handleAddProduct = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setUploadFile(null);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      // 添加文件
      if (uploadFile) {
        formData.append('file', uploadFile);
      }

      // 添加其他字段
      formData.append('productName', values.productName);
      formData.append('productDesc', values.productDesc);
      formData.append('originalPrice', values.originalPrice);
      formData.append('groupPrice', values.groupPrice);
      formData.append('stockQuantity', values.stockQuantity);

      // 处理分类
      const categoriesData = values.categories.map(categoryId => ({
        categoryId: parseInt(categoryId)
      }));
      formData.append('categories', JSON.stringify(categoriesData));

      setLoading(true);// 设置加载状态为 true
      await goodsService.uploadProduct(formData);
      message.success('商品添加成功');
      setIsModalVisible(false);
      form.resetFields();
      setUploadFile(null);
      fetchData(); // 刷新列表
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.message || '添加商品失败');
    } finally {
      setLoading(false);// 结束加载
    }
  };

  // 处理删除商品
  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除商品"${record.productName}"吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await goodsService.deleteGoods(record.productId);
          if (response.success) {
            message.success('商品删除成功');
            // 重新加载商品列表
            fetchData();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          message.error('删除商品时发生错误');
        }
      },
    });
  };

  // 文件上传改变处理
  const handleFileChange = (info) => {
    if (info.file) {
      setUploadFile(info.file);
    }
  };

  const handleImageChange = (info) => {
    const { fileList } = info;
    setEditFileList(fileList);
    
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageFile({
            file: file,
            previewUrl: e.target.result
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      setImageFile(null);
    }
  };

  const handleUpdateSubmit = async (values) => {
    try {
      // 如果有新的图片，先更新图片
      if (imageFile?.file) {
        const formData = new FormData();
        formData.append('file', imageFile.file);
        const imageResponse = await goodsService.updateProductImage(values.productId, formData);
        if (imageResponse.code === 200) {
          // 更新当前商品的图片URL
          setCurrentProduct(prev => ({
            ...prev,
            imageUrl: imageResponse.data.image_url
          }));
        } else {
          throw new Error(imageResponse.message || '更新图片失败');
        }
      }

      // 准备更新基本信息的数据
      const updateData = {
        productId: values.productId,
        productName: values.productName || currentProduct.productName,
        productDesc: values.productDesc || currentProduct.productDesc,
        originalPrice: values.originalPrice || currentProduct.originalPrice,
        groupPrice: values.groupPrice || currentProduct.groupPrice,
        stockQuantity: values.stockQuantity || currentProduct.stockQuantity,
        categories: (values.categories || currentProduct.categories.map(cat => cat.categoryId))
          .map(categoryId => ({ categoryId }))
      };

      // 更新商品基本信息
      const response = await goodsService.updateGoods(updateData);

      if (response.code === 200) {
        message.success('商品更新成功');
        setEditModalVisible(false);
        setImageFile(null);
        setEditFileList([]);
        form.resetFields();
        fetchData(); // 刷新列表
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      console.error('更新错误:', error);
      message.error(error.message || '更新商品时发生错误');
    }
  };

  const EditModal = () => (
    <Modal
      title="修改商品"
      open={editModalVisible}
      onCancel={() => {
        setEditModalVisible(false);
        setImageFile(null);
        setEditFileList([]);
        form.resetFields();
      }}
      onOk={() => {
        form.submit();
      }}
      width={720}
      bodyStyle={{ maxHeight: '400px', overflowY: 'auto' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleUpdateSubmit}
      >
        <Form.Item
          name="productId"
          label="商品ID"
        >
          <Input disabled style={{ backgroundColor: '#f5f5f5' }} />
        </Form.Item>

        <Form.Item
          name="productName"
          label="商品名称"
          initialValue={currentProduct?.productName}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="productDesc"
          label="商品描述"
          initialValue={currentProduct?.productDesc}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="originalPrice"
          label="原价"
          initialValue={currentProduct?.originalPrice}
        >
          <InputNumber
            style={{ width: '100%' }}
            precision={2}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="groupPrice"
          label="团购价"
          initialValue={currentProduct?.groupPrice}
        >
          <InputNumber
            style={{ width: '100%' }}
            precision={2}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="stockQuantity"
          label="库存数量"
          initialValue={currentProduct?.stockQuantity}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
          />
        </Form.Item>

        <Form.Item
          name="categories"
          label="商品分类"
          initialValue={currentProduct?.categories?.map(cat => cat.categoryId)}
        >
          <Select
            mode="multiple"
            style={{ width: '100%' }}
          >
            {categories.map(category => (
              <Select.Option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="商品图片"
        >
          <Upload
            accept="image/*"
            fileList={editFileList}
            beforeUpload={() => false}
            onChange={handleImageChange}
            maxCount={1}
            showUploadList={{
              showPreviewIcon: true,
              showRemoveIcon: true,
              showDownloadIcon: false
            }}
            listType="picture-card"
          >
            {editFileList.length === 0 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>选择图片</div>
              </div>
            )}
          </Upload>
          {!imageFile?.previewUrl && currentProduct?.imageUrl && (
            <div style={{ marginTop: '8px' }}>
              <span>当前图片：</span>
              <img 
                src={currentProduct.imageUrl}
                alt="当前商品图片" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginTop: '8px'
                }} 
              />
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );

  const handleSearchParamChange = (key, value) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Input
            placeholder="商品名称"
            value={searchParams.productName}
            onChange={(e) => handleSearchParamChange('productName', e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择分类"
            value={searchParams.categoryId}
            onChange={(value) => handleSearchParamChange('categoryId', value)}
            style={{ width: 200 }}
            allowClear
          >
            {categories.map(category => (
              <Option key={category.categoryId} value={category.categoryId}>
                {category.categoryName}
              </Option>
            ))}
          </Select>
          <Space>
            <Input
              placeholder="最低原价"
              value={searchParams.minOriginalPrice}
              onChange={(e) => handleSearchParamChange('minOriginalPrice', e.target.value)}
              style={{ width: 120 }}
            />
            <Input
              placeholder="最高原价"
              value={searchParams.maxOriginalPrice}
              onChange={(e) => handleSearchParamChange('maxOriginalPrice', e.target.value)}
              style={{ width: 120 }}
            />
          </Space>
          <Space>
            <Input
              placeholder="最低团购价"
              value={searchParams.minGroupPrice}
              onChange={(e) => handleSearchParamChange('minGroupPrice', e.target.value)}
              style={{ width: 120 }}
            />
            <Input
              placeholder="最高团购价"
              value={searchParams.maxGroupPrice}
              onChange={(e) => handleSearchParamChange('maxGroupPrice', e.target.value)}
              style={{ width: 120 }}
            />
          </Space>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            查询
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            添加商品
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          current: pagination.current,
          pageSize: pagination.size,
          total: pagination.total,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            fetchData({ current: page, size: pageSize });
          },
          onShowSizeChange: (current, size) => {
            fetchData({ current: 1, size });
          },
        }}
        loading={loading}
        rowKey="productId"
      />

      <Modal
        title="添加商品"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={720}
        bodyStyle={{ maxHeight: '400px', overflowY: 'auto' }} // 固定高度并启用滚动条
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="productName"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>

          <Form.Item
            name="productDesc"
            label="商品描述"
            rules={[{ required: true, message: '请输入商品描述' }]}
          >
            <Input.TextArea placeholder="请输入商品描述" rows={4} />
          </Form.Item>

          <Form.Item
            name="originalPrice"
            label="商品原价"
            rules={[{ required: true, message: '请输入商品原价' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入商品原价"
            />
          </Form.Item>

          <Form.Item
            name="groupPrice"
            label="团购价格"
            rules={[{ required: true, message: '请输入团购价格' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入团购价格"
            />
          </Form.Item>

          <Form.Item
            name="stockQuantity"
            label="库存数量"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder="请输入库存数量"
            />
          </Form.Item>

          <Form.Item
            name="categories"
            label="商品分类"
            rules={[{ required: true, message: '请选择商品分类' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择商品分类"
              style={{ width: '100%' }}
            >
              {categories.map(category => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="file"
            label="商品图片"
            rules={[{ required: true, message: '请上传商品图片' }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <EditModal />
    </div>
  );
};

export default GoodsList;
