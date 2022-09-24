package token

import (
	"crypto/rsa"
	"time"

	"github.com/dgrijalva/jwt-go"
)

//生成一个jwt的token
type JWTTokenGen struct {
	privateKey *rsa.PrivateKey
	issuer     string
	newFunc    func() time.Time
}

//构造函数
func NewJWTTokenGen(issuer string, privateKey *rsa.PrivateKey) *JWTTokenGen {
	return &JWTTokenGen{
		issuer:     issuer,
		newFunc:    time.Now,
		privateKey: privateKey,
	}
}

//Generator(accountID string, expire time.Duration)(string, error)
func (t *JWTTokenGen) GeneratorToken(accountID string, expire time.Duration) (string, error) {
	newSec := t.newFunc().Unix()
	tkn := jwt.NewWithClaims(jwt.SigningMethodRS512, jwt.StandardClaims{
		Issuer:    t.issuer,
		IssuedAt:  newSec,
		ExpiresAt: newSec + int64(expire.Seconds()),
		Subject:   accountID,
	})

	return tkn.SignedString(t.privateKey)
}
