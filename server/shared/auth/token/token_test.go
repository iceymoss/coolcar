package token

import (
	"testing"
	"time"

	"github.com/dgrijalva/jwt-go"
)

const PublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo
4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u
+qKhbwKfBstIs+bMY2Zkp18gnTxKLxoS2tFczGkPLPgizskuemMghRniWaoLcyeh
kd3qqGElvW/VDL5AaWTg0nLVkjRo9z+40RQzuVaE8AkAFmxZzow3x+VJYKdjykkJ
0iT9wCS0DRTXu269V264Vf/3jvredZiKRkgwlL9xNAwxXFg0x/XFw005UWVRIkdg
cKWTjpBP2dPwVZ4WWC+9aGVd+Gyn1o0CLelf4rEjGoXbAAEgAqeGUxrcIlbjXfbc
mwIDAQAB
-----END PUBLIC KEY-----`

func TestVerifier(t *testing.T) {
	key, err := jwt.ParseRSAPublicKeyFromPEM([]byte(PublicKey))
	if err != nil {
		t.Fatalf("不能解析PublicKey: %v", err)
	}
	Ver := &JWTTokenVerifier{
		PublicKey: key,
	}
	jwt.TimeFunc = func() time.Time {
		return time.Unix(1516239122, 0)
	}
	token := "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MTYyNDYyMjIsImlhdCI6MTUxNjIzOTAyMiwiaXNzIjoiY29vbGNhci9hdXRoIiwic3ViIjoiMTIzNDU2Nzg5MCJ9.GcHiRgOuFiiQJAMKJemV2j5Vr8uZslvOJksONETcsXxTpDqEJPHiwLsc94W3cvVpYrJO6O6c8mywxYjOWkk7iBoyEWMmbapsE8T3dDyFRq2xnV-1DZerlTNVuO4gT2fq3eNOEE-XXu0y0zlnCW7LMnOZdstHAkMD-ZQP0vKZuLJjP_AMhfd3BcsVXTMLVKjW0aG-UwkAhsathBa24NaLy2AsCIljSGNjmQ4gp9CihlHDRyUCRxBPuKDf0ym-tBSUgWk9zFugKlx-nSCYLSXgMPJ0CzgSDvmoXkC3HNM1VWOo-qd-QtInMYYuQs_RSPK8VVDj7EV7llHcjbki-OtRPA"
	sub, err := Ver.Verify(token)
	if err != nil {
		t.Fatalf("不能获取到sub: %v", err)
	}

	want := "1234567890"
	if sub != want {
		t.Errorf("生成错误的sub want: %q, got: %q", want, sub)
	}

}
