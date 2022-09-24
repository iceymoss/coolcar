export namespace routing{
    export interface DrivingOpt{
        trip_id: string

    }
    export function driving(o: DrivingOpt){
        return `/pages/driving/driving?trip_id=${o.trip_id}`
    }

    export interface LockOpt {
        car_id: string
    }
    export function Lock(o: LockOpt){
        return `/pages/lock/lock?car_id=${o.car_id}`
    }
    //export interface RegisterOpt

    export interface RegisterOpt{
        redirect?: string
    }

    export interface RegisterParams{
        redirectURL: string
    }

    export function register(p?: RegisterParams){
        const Page = `/pages/register/register`
        if(!p){
            return Page
        }
        return `${Page}?redirect=${encodeURIComponent(p.redirectURL)}` 
    }

    
    export function mytrips(){
        return '/pages/mytrips/mytrips'
    }
}