package handlers

import (
	"fmt"

	"github.com/gin-gonic/gin"
	pkgContext "github.com/oursky/likedao/pkg/context"
	hmacsha256util "github.com/oursky/likedao/pkg/utils/hmacsha256"
)

func GetSignedCookie(ctx *gin.Context, name string) (string, error) {
	config := pkgContext.GetConfigFromCtx(ctx.Request.Context())

	cookie, err := ctx.Cookie(name)
	if err != nil {
		return "", err
	}

	signedCookieName := fmt.Sprintf("%s.sig", name)
	signedCookie, err := ctx.Cookie(signedCookieName)
	if err != nil {
		return "", err
	}

	if !hmacsha256util.Verify(config.Session.SignatureSecret, cookie, signedCookie) {
		return "", fmt.Errorf("cookie signauture mismatch")
	}

	return cookie, nil
}

func SetSignedCookie(ctx *gin.Context, name string, value string, maxAge int, path string) {
	config := pkgContext.GetConfigFromCtx(ctx.Request.Context())

	isDebug := gin.Mode() == gin.DebugMode
	signedCookieName := fmt.Sprintf("%s.sig", name)
	signedCookie := hmacsha256util.Sign(config.Session.SignatureSecret, value)

	ctx.SetCookie(name, value, maxAge, path, config.Session.CookieDomain, !isDebug, true)
	ctx.SetCookie(signedCookieName, signedCookie, maxAge, path, config.Session.CookieDomain, !isDebug, true)
}

func RemoveSignedCookie(ctx *gin.Context, name string, path string) {
	config := pkgContext.GetConfigFromCtx(ctx.Request.Context())

	isDebug := gin.Mode() == gin.DebugMode
	signedCookieName := fmt.Sprintf("%s.sig", name)
	ctx.SetCookie(name, "", -1, path, config.Session.CookieDomain, !isDebug, true)
	ctx.SetCookie(signedCookieName, "", -1, path, config.Session.CookieDomain, !isDebug, true)
}
