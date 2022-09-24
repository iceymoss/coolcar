package ai

import (
	"context"

	rentalpb "coolcar/rental/api/gen/v1"
	coolenvpb "coolcar/shared/coolenv"
)

//计算距离
type Client struct {
	AIClient coolenvpb.AIServiceClient
}

//给定两个位置经纬度，计算两位置距离
func (c *Client) Distance(ctx context.Context, from *rentalpb.Location, to *rentalpb.Location) (float64, error) {
	dist, err := c.AIClient.MeasureDistance(ctx, &coolenvpb.MeasureDistanceRequest{
		From: &coolenvpb.Location{
			Latitude:  from.Latitude,
			Longitude: from.Longitude,
		},
		To: &coolenvpb.Location{
			Latitude:  to.Latitude,
			Longitude: to.Longitude,
		},
	})
	if err != nil {
		return 0, err
	}
	return dist.DistanceKm, nil
}
