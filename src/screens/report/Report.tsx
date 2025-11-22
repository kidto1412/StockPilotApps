import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ReportPage = () => {
  return (
    <ScrollView className="bg-gray-100 p-4">
      {/* Header */}
      <Text className="text-xl font-bold mb-4">June 2024</Text>

      {/* Summary */}
      <View className="flex-row justify-between mb-4">
        <View className="bg-green-100 p-4 rounded-lg flex-1 mr-2">
          <Text className="text-sm text-gray-500">Expenses</Text>
          <Text className="text-lg font-bold">$8,780.81</Text>
          <Text className="text-green-600 mt-1">▲ 20% than last month</Text>
        </View>
        <View className="bg-purple-100 p-4 rounded-lg flex-1 ml-2">
          <Text className="text-sm text-gray-500">Money In</Text>
          <Text className="text-lg font-bold">$8,780.81</Text>
          <Text className="text-red-600 mt-1">▼ 20% than last month</Text>
        </View>
      </View>

      {/* Chart */}
      <LineChart
        data={{
          labels: ['1-7', '8-14', '15-21', '22-28', '29-30'],
          datasets: [
            {
              data: [1000, 2000, 2400, 5100, 1200],
              color: () => 'rgba(34,197,94,0.6)', // green for expenses
            },
            {
              data: [500, 1500, 2100, 3500, 900],
              color: () => 'rgba(139,92,246,0.6)', // purple for money in
            },
          ],
          legend: ['Expenses', 'Money In'],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#f0f0f0',
          backgroundGradientTo: '#f0f0f0',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#fff',
          },
        }}
        style={{ borderRadius: 12, marginBottom: 16 }}
      />

      {/* Other Report */}
      <View className="flex-row flex-wrap justify-between">
        <View className="bg-blue-100 p-4 rounded-lg w-[48%] mb-4">
          <Text className="text-sm text-gray-500">Total Orders</Text>
          <Text className="text-lg font-bold">10,580</Text>
        </View>
        <View className="bg-yellow-100 p-4 rounded-lg w-[48%] mb-4">
          <Text className="text-sm text-gray-500">Views Product</Text>
          <Text className="text-lg font-bold">2,234</Text>
        </View>
        <View className="bg-pink-100 p-4 rounded-lg w-[48%] mb-4">
          <Text className="text-sm text-gray-500">Total Customers</Text>
          <Text className="text-lg font-bold">24,805</Text>
        </View>
        <View className="bg-orange-100 p-4 rounded-lg w-[48%] mb-4">
          <Text className="text-sm text-gray-500">Total Delivery</Text>
          <Text className="text-lg font-bold">11,250</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportPage;
