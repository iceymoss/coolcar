package main

import (
	"fmt"
	"log"
	"net/http"
	"net/textproto"

	authpb "coolcar/auth/api/gen/v1"
	carpb "coolcar/car/api/gen/v1"
	rentalpb "coolcar/rental/api/gen/v1"
	"coolcar/shared/auth"
	"coolcar/shared/server"

	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/namsral/flag"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

var addr = flag.String("addr", ":8080", "address to listen")
var authAddr = flag.String("auth_addr", "localhost:8081", "address for auth service")
var tripAddr = flag.String("trip_addr", "localhost:8082", "address for trip service")
var profileAddr = flag.String("profile_addr", "localhost:8082", "address for profile service")
var carAddr = flag.String("car_addr", "localhost:8084", "address for car service")

//代理网关
func main() {
	flag.Parse()

	lg, err := server.NewZapLogger()
	if err != nil {
		log.Fatalf("cannot create zap logger: %v", err)
	}
	c := context.Background()
	c, cancel := context.WithCancel(c)
	defer cancel()

	mux := runtime.NewServeMux(runtime.WithMarshalerOption(
		runtime.MIMEWildcard, &runtime.JSONPb{ //数据格式，例如驼峰命名
			EnumsAsInts: true,
			OrigName:    true,
		},
	), runtime.WithIncomingHeaderMatcher(func(key string) (string, bool) {
		if key == textproto.CanonicalMIMEHeaderKey(runtime.MetadataHeaderPrefix+auth.ImpersonateAccountHeader) {
			return "", false
		}
		return runtime.DefaultHeaderMatcher(key)
	}))

	serverConfig := []struct {
		name         string
		addr         string
		registerFunc func(ctx context.Context, mux *runtime.ServeMux, endpoint string, opts []grpc.DialOption) (err error)
	}{
		{
			name:         "auth",
			addr:         *authAddr,
			registerFunc: authpb.RegisterAuthServiceHandlerFromEndpoint,
		},
		{
			name:         "rental",
			addr:         *tripAddr,
			registerFunc: rentalpb.RegisterTripServiceHandlerFromEndpoint,
		},
		{
			name:         "profile",
			addr:         *profileAddr,
			registerFunc: rentalpb.RegisterProfileServiceHandlerFromEndpoint,
		},
		{
			name:         "car",
			addr:         *carAddr,
			registerFunc: carpb.RegisterCarServiceHandlerFromEndpoint,
		},
	}

	for _, s := range serverConfig {
		err := s.registerFunc(
			c, mux, s.addr, []grpc.DialOption{grpc.WithInsecure()},
		)

		if err != nil {
			log.Fatalf("cannot reggister %v service: %v", s.name, err)
		}
	}
	fmt.Printf("this is gateway:%v", *authAddr)
	lg.Sugar().Info("auth_addr at:", *authAddr)
	lg.Sugar().Info("trip_addr at:", *tripAddr)
	lg.Sugar().Info("porfiel_addr at:", *profileAddr)
	lg.Sugar().Info("car_addr at:", *carAddr)

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
	http.Handle("/", mux)

	//监听代理端口
	lg.Sugar().Info("GRPC gateway started at:", *addr)
	lg.Sugar().Fatal(http.ListenAndServe(*addr, nil))

}
