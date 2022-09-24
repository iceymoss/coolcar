package objid

import (
	"fmt"

	"coolcar/shared/id"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

//FromID将一个id转换为Object id
func FromID(id fmt.Stringer) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(id.String())
}

//MustFromID将一个id转换为Object id
func MustFromID(id fmt.Stringer) primitive.ObjectID {
	oid, err := FromID(id)
	if err != nil {
		panic(err)
	}
	return oid
}

//ToAccount将 primitive.ObjectID转换为string id
func ToAccountID(oid primitive.ObjectID) id.AccountID {
	return id.AccountID(oid.Hex())
}

//ToTripID将 primitive.ObjectID转换为string id
func ToTripID(oid primitive.ObjectID) id.TripID {
	return id.TripID(oid.Hex())
}
