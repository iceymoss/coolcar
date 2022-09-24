package id

//强类型化: AccountID定义account id对象类型
type AccountID string

func (a AccountID) String() string {
	return string(a)
}

//TripID 定义一个trip id
type TripID string

func (t TripID) String() string {
	return string(t)
}

//Identity定义一个用户身份
type IdentityID string

func (i IdentityID) String() string {
	return string(i)
}

//CarId定义一个车辆id
type CarID string

func (c CarID) String() string {
	return string(c)
}

//BlobID定义一个blobID
type BlobID string

func (b BlobID) String() string {
	return string(b)
}
