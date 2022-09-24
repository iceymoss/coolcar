// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.26.0
// 	protoc        v3.13.0
// source: blob.proto

package blobpb

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

//不对外暴露接口，不需要配置yaml文件
//proflie传入的accountID和有效期
type CreateBlobRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Account             string `protobuf:"bytes,1,opt,name=account,proto3" json:"account,omitempty"`
	UploadUrlTimeoutSec int32  `protobuf:"varint,2,opt,name=upload_url_timeout_sec,json=uploadUrlTimeoutSec,proto3" json:"upload_url_timeout_sec,omitempty"`
}

func (x *CreateBlobRequest) Reset() {
	*x = CreateBlobRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_blob_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreateBlobRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreateBlobRequest) ProtoMessage() {}

func (x *CreateBlobRequest) ProtoReflect() protoreflect.Message {
	mi := &file_blob_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreateBlobRequest.ProtoReflect.Descriptor instead.
func (*CreateBlobRequest) Descriptor() ([]byte, []int) {
	return file_blob_proto_rawDescGZIP(), []int{0}
}

func (x *CreateBlobRequest) GetAccount() string {
	if x != nil {
		return x.Account
	}
	return ""
}

func (x *CreateBlobRequest) GetUploadUrlTimeoutSec() int32 {
	if x != nil {
		return x.UploadUrlTimeoutSec
	}
	return 0
}

//返回blobID和上传储桶预签名url
type CreateBlobResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id        string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	UploadUrl string `protobuf:"bytes,2,opt,name=upload_url,json=uploadUrl,proto3" json:"upload_url,omitempty"`
}

func (x *CreateBlobResponse) Reset() {
	*x = CreateBlobResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_blob_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreateBlobResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreateBlobResponse) ProtoMessage() {}

func (x *CreateBlobResponse) ProtoReflect() protoreflect.Message {
	mi := &file_blob_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreateBlobResponse.ProtoReflect.Descriptor instead.
func (*CreateBlobResponse) Descriptor() ([]byte, []int) {
	return file_blob_proto_rawDescGZIP(), []int{1}
}

func (x *CreateBlobResponse) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *CreateBlobResponse) GetUploadUrl() string {
	if x != nil {
		return x.UploadUrl
	}
	return ""
}

//profile传入的blobID
type GetBlobRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *GetBlobRequest) Reset() {
	*x = GetBlobRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_blob_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetBlobRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetBlobRequest) ProtoMessage() {}

func (x *GetBlobRequest) ProtoReflect() protoreflect.Message {
	mi := &file_blob_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetBlobRequest.ProtoReflect.Descriptor instead.
func (*GetBlobRequest) Descriptor() ([]byte, []int) {
	return file_blob_proto_rawDescGZIP(), []int{2}
}

func (x *GetBlobRequest) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

//返回data
type GetBlobResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Data []byte `protobuf:"bytes,1,opt,name=data,proto3" json:"data,omitempty"`
}

func (x *GetBlobResponse) Reset() {
	*x = GetBlobResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_blob_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetBlobResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetBlobResponse) ProtoMessage() {}

func (x *GetBlobResponse) ProtoReflect() protoreflect.Message {
	mi := &file_blob_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetBlobResponse.ProtoReflect.Descriptor instead.
func (*GetBlobResponse) Descriptor() ([]byte, []int) {
	return file_blob_proto_rawDescGZIP(), []int{3}
}

func (x *GetBlobResponse) GetData() []byte {
	if x != nil {
		return x.Data
	}
	return nil
}

//profile给定blobID和有效期去获取图片url
type GetBlobURLRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id         string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	TimeoutSec int32  `protobuf:"varint,2,opt,name=timeout_sec,json=timeoutSec,proto3" json:"timeout_sec,omitempty"`
}

func (x *GetBlobURLRequest) Reset() {
	*x = GetBlobURLRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_blob_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetBlobURLRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetBlobURLRequest) ProtoMessage() {}

func (x *GetBlobURLRequest) ProtoReflect() protoreflect.Message {
	mi := &file_blob_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetBlobURLRequest.ProtoReflect.Descriptor instead.
func (*GetBlobURLRequest) Descriptor() ([]byte, []int) {
	return file_blob_proto_rawDescGZIP(), []int{4}
}

func (x *GetBlobURLRequest) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *GetBlobURLRequest) GetTimeoutSec() int32 {
	if x != nil {
		return x.TimeoutSec
	}
	return 0
}

//返回图片URL
type GetBlobURLResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Url string `protobuf:"bytes,1,opt,name=url,proto3" json:"url,omitempty"`
}

func (x *GetBlobURLResponse) Reset() {
	*x = GetBlobURLResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_blob_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetBlobURLResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetBlobURLResponse) ProtoMessage() {}

func (x *GetBlobURLResponse) ProtoReflect() protoreflect.Message {
	mi := &file_blob_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetBlobURLResponse.ProtoReflect.Descriptor instead.
func (*GetBlobURLResponse) Descriptor() ([]byte, []int) {
	return file_blob_proto_rawDescGZIP(), []int{5}
}

func (x *GetBlobURLResponse) GetUrl() string {
	if x != nil {
		return x.Url
	}
	return ""
}

var File_blob_proto protoreflect.FileDescriptor

var file_blob_proto_rawDesc = []byte{
	0x0a, 0x0a, 0x62, 0x6c, 0x6f, 0x62, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x07, 0x62, 0x6c,
	0x6f, 0x62, 0x2e, 0x76, 0x31, 0x22, 0x62, 0x0a, 0x11, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x42,
	0x6c, 0x6f, 0x62, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x18, 0x0a, 0x07, 0x61, 0x63,
	0x63, 0x6f, 0x75, 0x6e, 0x74, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x61, 0x63, 0x63,
	0x6f, 0x75, 0x6e, 0x74, 0x12, 0x33, 0x0a, 0x16, 0x75, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x5f, 0x75,
	0x72, 0x6c, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x5f, 0x73, 0x65, 0x63, 0x18, 0x02,
	0x20, 0x01, 0x28, 0x05, 0x52, 0x13, 0x75, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x55, 0x72, 0x6c, 0x54,
	0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x53, 0x65, 0x63, 0x22, 0x43, 0x0a, 0x12, 0x43, 0x72, 0x65,
	0x61, 0x74, 0x65, 0x42, 0x6c, 0x6f, 0x62, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12,
	0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12,
	0x1d, 0x0a, 0x0a, 0x75, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x5f, 0x75, 0x72, 0x6c, 0x18, 0x02, 0x20,
	0x01, 0x28, 0x09, 0x52, 0x09, 0x75, 0x70, 0x6c, 0x6f, 0x61, 0x64, 0x55, 0x72, 0x6c, 0x22, 0x20,
	0x0a, 0x0e, 0x47, 0x65, 0x74, 0x42, 0x6c, 0x6f, 0x62, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64,
	0x22, 0x25, 0x0a, 0x0f, 0x47, 0x65, 0x74, 0x42, 0x6c, 0x6f, 0x62, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x12, 0x12, 0x0a, 0x04, 0x64, 0x61, 0x74, 0x61, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x0c, 0x52, 0x04, 0x64, 0x61, 0x74, 0x61, 0x22, 0x44, 0x0a, 0x11, 0x47, 0x65, 0x74, 0x42, 0x6c,
	0x6f, 0x62, 0x55, 0x52, 0x4c, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x0e, 0x0a, 0x02,
	0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x1f, 0x0a, 0x0b,
	0x74, 0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x5f, 0x73, 0x65, 0x63, 0x18, 0x02, 0x20, 0x01, 0x28,
	0x05, 0x52, 0x0a, 0x74, 0x69, 0x6d, 0x65, 0x6f, 0x75, 0x74, 0x53, 0x65, 0x63, 0x22, 0x26, 0x0a,
	0x12, 0x47, 0x65, 0x74, 0x42, 0x6c, 0x6f, 0x62, 0x55, 0x52, 0x4c, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x12, 0x10, 0x0a, 0x03, 0x75, 0x72, 0x6c, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x03, 0x75, 0x72, 0x6c, 0x32, 0xd9, 0x01, 0x0a, 0x0b, 0x42, 0x6c, 0x6f, 0x62, 0x53, 0x65,
	0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x45, 0x0a, 0x0a, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x42,
	0x6c, 0x6f, 0x62, 0x12, 0x1a, 0x2e, 0x62, 0x6c, 0x6f, 0x62, 0x2e, 0x76, 0x31, 0x2e, 0x43, 0x72,
	0x65, 0x61, 0x74, 0x65, 0x42, 0x6c, 0x6f, 0x62, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a,
	0x1b, 0x2e, 0x62, 0x6c, 0x6f, 0x62, 0x2e, 0x76, 0x31, 0x2e, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65,
	0x42, 0x6c, 0x6f, 0x62, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x3c, 0x0a, 0x07,
	0x47, 0x65, 0x74, 0x42, 0x6c, 0x6f, 0x62, 0x12, 0x17, 0x2e, 0x62, 0x6c, 0x6f, 0x62, 0x2e, 0x76,
	0x31, 0x2e, 0x47, 0x65, 0x74, 0x42, 0x6c, 0x6f, 0x62, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x1a, 0x18, 0x2e, 0x62, 0x6c, 0x6f, 0x62, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74, 0x42, 0x6c,
	0x6f, 0x62, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x45, 0x0a, 0x0a, 0x47, 0x65,
	0x74, 0x42, 0x6c, 0x6f, 0x62, 0x55, 0x52, 0x4c, 0x12, 0x1a, 0x2e, 0x62, 0x6c, 0x6f, 0x62, 0x2e,
	0x76, 0x31, 0x2e, 0x47, 0x65, 0x74, 0x42, 0x6c, 0x6f, 0x62, 0x55, 0x52, 0x4c, 0x52, 0x65, 0x71,
	0x75, 0x65, 0x73, 0x74, 0x1a, 0x1b, 0x2e, 0x62, 0x6c, 0x6f, 0x62, 0x2e, 0x76, 0x31, 0x2e, 0x47,
	0x65, 0x74, 0x42, 0x6c, 0x6f, 0x62, 0x55, 0x52, 0x4c, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73,
	0x65, 0x42, 0x20, 0x5a, 0x1e, 0x63, 0x6f, 0x6f, 0x6c, 0x63, 0x61, 0x72, 0x2f, 0x62, 0x6c, 0x6f,
	0x62, 0x2f, 0x61, 0x70, 0x69, 0x2f, 0x67, 0x65, 0x6e, 0x2f, 0x76, 0x31, 0x3b, 0x62, 0x6c, 0x6f,
	0x62, 0x70, 0x62, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_blob_proto_rawDescOnce sync.Once
	file_blob_proto_rawDescData = file_blob_proto_rawDesc
)

func file_blob_proto_rawDescGZIP() []byte {
	file_blob_proto_rawDescOnce.Do(func() {
		file_blob_proto_rawDescData = protoimpl.X.CompressGZIP(file_blob_proto_rawDescData)
	})
	return file_blob_proto_rawDescData
}

var file_blob_proto_msgTypes = make([]protoimpl.MessageInfo, 6)
var file_blob_proto_goTypes = []interface{}{
	(*CreateBlobRequest)(nil),  // 0: blob.v1.CreateBlobRequest
	(*CreateBlobResponse)(nil), // 1: blob.v1.CreateBlobResponse
	(*GetBlobRequest)(nil),     // 2: blob.v1.GetBlobRequest
	(*GetBlobResponse)(nil),    // 3: blob.v1.GetBlobResponse
	(*GetBlobURLRequest)(nil),  // 4: blob.v1.GetBlobURLRequest
	(*GetBlobURLResponse)(nil), // 5: blob.v1.GetBlobURLResponse
}
var file_blob_proto_depIdxs = []int32{
	0, // 0: blob.v1.BlobService.CreateBlob:input_type -> blob.v1.CreateBlobRequest
	2, // 1: blob.v1.BlobService.GetBlob:input_type -> blob.v1.GetBlobRequest
	4, // 2: blob.v1.BlobService.GetBlobURL:input_type -> blob.v1.GetBlobURLRequest
	1, // 3: blob.v1.BlobService.CreateBlob:output_type -> blob.v1.CreateBlobResponse
	3, // 4: blob.v1.BlobService.GetBlob:output_type -> blob.v1.GetBlobResponse
	5, // 5: blob.v1.BlobService.GetBlobURL:output_type -> blob.v1.GetBlobURLResponse
	3, // [3:6] is the sub-list for method output_type
	0, // [0:3] is the sub-list for method input_type
	0, // [0:0] is the sub-list for extension type_name
	0, // [0:0] is the sub-list for extension extendee
	0, // [0:0] is the sub-list for field type_name
}

func init() { file_blob_proto_init() }
func file_blob_proto_init() {
	if File_blob_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_blob_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreateBlobRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_blob_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreateBlobResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_blob_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetBlobRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_blob_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetBlobResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_blob_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetBlobURLRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_blob_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetBlobURLResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_blob_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   6,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_blob_proto_goTypes,
		DependencyIndexes: file_blob_proto_depIdxs,
		MessageInfos:      file_blob_proto_msgTypes,
	}.Build()
	File_blob_proto = out.File
	file_blob_proto_rawDesc = nil
	file_blob_proto_goTypes = nil
	file_blob_proto_depIdxs = nil
}

// Reference imports to suppress errors if they are not otherwise used.
var _ context.Context
var _ grpc.ClientConnInterface

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
const _ = grpc.SupportPackageIsVersion6

// BlobServiceClient is the client API for BlobService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://godoc.org/google.golang.org/grpc#ClientConn.NewStream.
type BlobServiceClient interface {
	CreateBlob(ctx context.Context, in *CreateBlobRequest, opts ...grpc.CallOption) (*CreateBlobResponse, error)
	GetBlob(ctx context.Context, in *GetBlobRequest, opts ...grpc.CallOption) (*GetBlobResponse, error)
	GetBlobURL(ctx context.Context, in *GetBlobURLRequest, opts ...grpc.CallOption) (*GetBlobURLResponse, error)
}

type blobServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewBlobServiceClient(cc grpc.ClientConnInterface) BlobServiceClient {
	return &blobServiceClient{cc}
}

func (c *blobServiceClient) CreateBlob(ctx context.Context, in *CreateBlobRequest, opts ...grpc.CallOption) (*CreateBlobResponse, error) {
	out := new(CreateBlobResponse)
	err := c.cc.Invoke(ctx, "/blob.v1.BlobService/CreateBlob", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *blobServiceClient) GetBlob(ctx context.Context, in *GetBlobRequest, opts ...grpc.CallOption) (*GetBlobResponse, error) {
	out := new(GetBlobResponse)
	err := c.cc.Invoke(ctx, "/blob.v1.BlobService/GetBlob", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *blobServiceClient) GetBlobURL(ctx context.Context, in *GetBlobURLRequest, opts ...grpc.CallOption) (*GetBlobURLResponse, error) {
	out := new(GetBlobURLResponse)
	err := c.cc.Invoke(ctx, "/blob.v1.BlobService/GetBlobURL", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// BlobServiceServer is the server API for BlobService service.
type BlobServiceServer interface {
	CreateBlob(context.Context, *CreateBlobRequest) (*CreateBlobResponse, error)
	GetBlob(context.Context, *GetBlobRequest) (*GetBlobResponse, error)
	GetBlobURL(context.Context, *GetBlobURLRequest) (*GetBlobURLResponse, error)
}

// UnimplementedBlobServiceServer can be embedded to have forward compatible implementations.
type UnimplementedBlobServiceServer struct {
}

func (*UnimplementedBlobServiceServer) CreateBlob(context.Context, *CreateBlobRequest) (*CreateBlobResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreateBlob not implemented")
}
func (*UnimplementedBlobServiceServer) GetBlob(context.Context, *GetBlobRequest) (*GetBlobResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetBlob not implemented")
}
func (*UnimplementedBlobServiceServer) GetBlobURL(context.Context, *GetBlobURLRequest) (*GetBlobURLResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetBlobURL not implemented")
}

func RegisterBlobServiceServer(s *grpc.Server, srv BlobServiceServer) {
	s.RegisterService(&_BlobService_serviceDesc, srv)
}

func _BlobService_CreateBlob_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CreateBlobRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(BlobServiceServer).CreateBlob(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/blob.v1.BlobService/CreateBlob",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(BlobServiceServer).CreateBlob(ctx, req.(*CreateBlobRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _BlobService_GetBlob_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetBlobRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(BlobServiceServer).GetBlob(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/blob.v1.BlobService/GetBlob",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(BlobServiceServer).GetBlob(ctx, req.(*GetBlobRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _BlobService_GetBlobURL_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetBlobURLRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(BlobServiceServer).GetBlobURL(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/blob.v1.BlobService/GetBlobURL",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(BlobServiceServer).GetBlobURL(ctx, req.(*GetBlobURLRequest))
	}
	return interceptor(ctx, in, info, handler)
}

var _BlobService_serviceDesc = grpc.ServiceDesc{
	ServiceName: "blob.v1.BlobService",
	HandlerType: (*BlobServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "CreateBlob",
			Handler:    _BlobService_CreateBlob_Handler,
		},
		{
			MethodName: "GetBlob",
			Handler:    _BlobService_GetBlob_Handler,
		},
		{
			MethodName: "GetBlobURL",
			Handler:    _BlobService_GetBlobURL_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "blob.proto",
}
