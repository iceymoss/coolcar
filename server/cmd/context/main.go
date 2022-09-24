package main

import (
	"context"
	"fmt"
	"time"
)

//context的学习和使用

type pramKey struct{}

func main() {
	c := context.WithValue(context.Background(), pramKey{}, "myTask")
	c, cancel := context.WithTimeout(c, 5*time.Second)
	defer cancel()
	mainTast(c)

	time.Sleep(time.Hour)
}

func mainTast(c context.Context) {
	fmt.Printf("start Task: %q\n", c.Value(pramKey{}))
	go func() {
		c1, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		smallTast(c1, "tast1", 9*time.Second)
	}()
	smallTast(c, "tast2", 2*time.Second)

	// c1, cancel := context.WithTimeout(context.Background(), 9*time.Second)
	// defer cancel()
	// go smallTast(c1, "tast1", 10*time.Second)
	// smallTast(c, "tast2", 2*time.Second)

}

func smallTast(c context.Context, name string, ti time.Duration) {
	fmt.Printf("this is my name: %v, value: %q\n", name, c.Value(pramKey{}))
	select {
	case <-time.After(ti):
		fmt.Printf("%s 允许运行时间结束\n", name)
	case k := <-c.Done():
		fmt.Printf("%s cancalled\n", name)
		fmt.Printf("chan give value: %q\n", k)
	}

}
