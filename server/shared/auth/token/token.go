package token

import (
	"crypto/rsa"
	"fmt"

	"github.com/dgrijalva/jwt-go"
)

type JWTTokenVerifier struct {
	PublicKey *rsa.PublicKey
}

//解析token，返回accountID
func (v *JWTTokenVerifier) Verify(token string) (string, error) {
	t, err := jwt.ParseWithClaims(token, &jwt.StandardClaims{}, func(*jwt.Token) (interface{}, error) {
		return v.PublicKey, nil
	})
	if err != nil {
		return "", fmt.Errorf("不能解析token: %v", err)
	}

	if !t.Valid {
		return "", fmt.Errorf("无效的token")
	}

	cli, ok := t.Claims.(*jwt.StandardClaims)
	if !ok {
		return "", fmt.Errorf("token claims 不是一个standardClims: %v", ok)
	}
	//验证Claims,里面的所有的字段，例如： "exp"
	if err := cli.Valid(); err != nil {
		return "", fmt.Errorf("无效的Cliams: err")
	}
	return cli.Subject, nil
}
