
// Get color for a sensor based on its colorIndex
export const getSensorColor = (colorIndex: number = 1) => {
  const colors = {
    1: 'rgb(139, 92, 246)', // sensor-1 (#8B5CF6)
    2: 'rgb(217, 70, 239)', // sensor-2 (#D946EF)
    3: 'rgb(249, 115, 22)', // sensor-3 (#F97316)
    4: 'rgb(6, 182, 212)',  // sensor-4 (#06B6D4)
    5: 'rgb(34, 197, 94)',  // sensor-5 (#22C55E)
    6: 'rgb(234, 179, 8)',  // sensor-6 (#EAB308)
    7: 'rgb(236, 72, 153)', // sensor-7 (#EC4899)
    8: 'rgb(20, 184, 166)', // sensor-8 (#14B8A6)
  };
  
  return colors[colorIndex as keyof typeof colors] || colors[1];
};
