export interface CountryData {
  name: string
  code: string
  states: {
    name: string
    cities: string[]
  }[]
}

export const COUNTRIES_DATA: CountryData[] = [
  {
    name: 'India',
    code: 'IN',
    states: [
      {
        name: 'Uttar Pradesh',
        cities: [
          'Mathura',
          'Agra',
          'Noida',
          'Greater Noida',
          'Lucknow',
          'Kanpur',
          'Varanasi',
          'Prayagraj',
          'Ghaziabad',
          'Aligarh',
          'Meerut',
          'Bareilly',
          'Gorakhpur',
          'Jhansi',
          'Ayodhya',
          'Firozabad',
          'Muzaffarnagar',
          'Saharanpur',
        ],
      },
      {
        name: 'Delhi (NCT)',
        cities: [
          'New Delhi',
          'Central Delhi',
          'South Delhi',
          'North Delhi',
          'West Delhi',
          'East Delhi',
          'Dwarka',
          'Rohini',
          'Connaught Place',
          'Saket',
        ],
      },
      {
        name: 'Maharashtra',
        cities: [
          'Mumbai',
          'Pune',
          'Nagpur',
          'Nashik',
          'Thane',
          'Navi Mumbai',
          'Aurangabad (Chhatrapati Sambhajinagar)',
          'Solapur',
          'Kolhapur',
          'Amravati',
        ],
      },
      {
        name: 'Karnataka',
        cities: [
          'Bengaluru',
          'Mysuru',
          'Mangaluru',
          'Hubballi-Dharwad',
          'Belagavi',
          'Kalaburagi',
          'Udupi',
          'Shivamogga',
        ],
      },
      {
        name: 'Haryana',
        cities: [
          'Gurugram',
          'Faridabad',
          'Panipat',
          'Ambala',
          'Karnal',
          'Sonipat',
          'Panchkula',
          'Hisar',
          'Rohtak',
        ],
      },
      {
        name: 'Rajasthan',
        cities: [
          'Jaipur',
          'Jodhpur',
          'Udaipur',
          'Kota',
          'Ajmer',
          'Bikaner',
          'Alwar',
          'Bhilwara',
          'Bharatpur',
        ],
      },
      {
        name: 'Tamil Nadu',
        cities: [
          'Chennai',
          'Coimbatore',
          'Madurai',
          'Tiruchirappalli',
          'Salem',
          'Tirunelveli',
          'Erode',
          'Vellore',
        ],
      },
      {
        name: 'Telangana',
        cities: [
          'Hyderabad',
          'Warangal',
          'Nizamabad',
          'Karimnagar',
          'Khammam',
          'Secunderabad',
        ],
      },
      {
        name: 'Gujarat',
        cities: [
          'Ahmedabad',
          'Surat',
          'Vadodara',
          'Rajkot',
          'Bhavnagar',
          'Jamnagar',
          'Gandhinagar',
          'Junagadh',
        ],
      },
      {
        name: 'Madhya Pradesh',
        cities: [
          'Bhopal',
          'Indore',
          'Gwalior',
          'Jabalpur',
          'Ujjain',
          'Sagar',
          'Dewas',
          'Satna',
        ],
      },
      {
        name: 'West Bengal',
        cities: [
          'Kolkata',
          'Howrah',
          'Durgapur',
          'Asansol',
          'Siliguri',
          'Kharagpur',
          'Bardhaman',
        ],
      },
      {
        name: 'Punjab',
        cities: [
          'Chandigarh',
          'Amritsar',
          'Ludhiana',
          'Jalandhar',
          'Patiala',
          'Bathinda',
          'Mohali',
        ],
      },
      {
        name: 'Uttarakhand',
        cities: [
          'Dehradun',
          'Haridwar',
          'Rishikesh',
          'Haldwani',
          'Roorkee',
          'Nainital',
          'Kashipur',
        ],
      },
      {
        name: 'Bihar',
        cities: [
          'Patna',
          'Gaya',
          'Bhagalpur',
          'Muzaffarpur',
          'Darbhanga',
          'Purnia',
        ],
      },
      {
        name: 'Kerala',
        cities: [
          'Thiruvananthapuram',
          'Kochi',
          'Kozhikode',
          'Thrissur',
          'Kollam',
          'Kannur',
          'Alappuzha',
        ],
      },
      {
        name: 'Andhra Pradesh',
        cities: [
          'Visakhapatnam',
          'Vijayawada',
          'Guntur',
          'Nellore',
          'Kurnool',
          'Tirupati',
        ],
      },
      {
        name: 'Odisha',
        cities: [
          'Bhubaneswar',
          'Cuttack',
          'Rourkela',
          'Berhampur',
          'Sambalpur',
          'Puri',
        ],
      },
      {
        name: 'Assam',
        cities: [
          'Guwahati',
          'Silchar',
          'Dibrugarh',
          'Jorhat',
          'Nagaon',
          'Tezpur',
        ],
      },
      {
        name: 'Goa',
        cities: [
          'Panaji',
          'Margao',
          'Vasco da Gama',
          'Mapusa',
          'Ponda',
        ],
      },
      {
        name: 'Himachal Pradesh',
        cities: [
          'Shimla',
          'Dharamshala',
          'Mandi',
          'Solan',
          'Manali',
          'Kullu',
        ],
      },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    states: [
      {
        name: 'California',
        cities: [
          'Los Angeles',
          'San Francisco',
          'San Diego',
          'San Jose',
          'Sacramento',
          'Oakland',
          'Palo Alto',
          'Irvine',
        ],
      },
      {
        name: 'New York',
        cities: [
          'New York City',
          'Buffalo',
          'Rochester',
          'Albany',
          'Syracuse',
          'Yonkers',
        ],
      },
      {
        name: 'Texas',
        cities: [
          'Austin',
          'Houston',
          'Dallas',
          'San Antonio',
          'Fort Worth',
          'El Paso',
        ],
      },
      {
        name: 'Washington',
        cities: [
          'Seattle',
          'Bellevue',
          'Tacoma',
          'Spokane',
          'Redmond',
        ],
      },
      {
        name: 'Florida',
        cities: [
          'Miami',
          'Orlando',
          'Tampa',
          'Jacksonville',
          'Fort Lauderdale',
        ],
      },
      {
        name: 'Illinois',
        cities: [
          'Chicago',
          'Naperville',
          'Aurora',
          'Rockford',
        ],
      },
      {
        name: 'Massachusetts',
        cities: [
          'Boston',
          'Cambridge',
          'Worcester',
          'Springfield',
        ],
      },
    ],
  },
  {
    name: 'United Kingdom',
    code: 'UK',
    states: [
      {
        name: 'England',
        cities: [
          'London',
          'Manchester',
          'Birmingham',
          'Leeds',
          'Liverpool',
          'Bristol',
          'Cambridge',
          'Oxford',
        ],
      },
      {
        name: 'Scotland',
        cities: [
          'Edinburgh',
          'Glasgow',
          'Aberdeen',
          'Dundee',
        ],
      },
      {
        name: 'Wales',
        cities: [
          'Cardiff',
          'Swansea',
          'Newport',
        ],
      },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      {
        name: 'Ontario',
        cities: [
          'Toronto',
          'Ottawa',
          'Mississauga',
          'Brampton',
          'Hamilton',
          'Waterloo',
        ],
      },
      {
        name: 'British Columbia',
        cities: [
          'Vancouver',
          'Victoria',
          'Surrey',
          'Burnaby',
          'Richmond',
        ],
      },
      {
        name: 'Quebec',
        cities: [
          'Montreal',
          'Quebec City',
          'Laval',
          'Gatineau',
        ],
      },
      {
        name: 'Alberta',
        cities: [
          'Calgary',
          'Edmonton',
          'Red Deer',
        ],
      },
    ],
  },
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          'Sydney',
          'Newcastle',
          'Wollongong',
          'Central Coast',
        ],
      },
      {
        name: 'Victoria',
        cities: [
          'Melbourne',
          'Geelong',
          'Ballarat',
          'Bendigo',
        ],
      },
      {
        name: 'Queensland',
        cities: [
          'Brisbane',
          'Gold Coast',
          'Sunshine Coast',
          'Cairns',
        ],
      },
    ],
  },
  {
    name: 'Germany',
    code: 'DE',
    states: [
      {
        name: 'Bavaria',
        cities: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
      },
      {
        name: 'Berlin',
        cities: ['Berlin'],
      },
      {
        name: 'North Rhine-Westphalia',
        cities: ['Cologne', 'Dusseldorf', 'Dortmund', 'Essen'],
      },
      {
        name: 'Hesse',
        cities: ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt'],
      },
    ],
  },
  {
    name: 'United Arab Emirates',
    code: 'AE',
    states: [
      {
        name: 'Dubai',
        cities: ['Dubai', 'Downtown Dubai', 'Dubai Marina', 'Deira', 'Jumeirah'],
      },
      {
        name: 'Abu Dhabi',
        cities: ['Abu Dhabi City', 'Al Ain', 'Madinat Zayed'],
      },
      {
        name: 'Sharjah',
        cities: ['Sharjah City', 'Khor Fakkan', 'Kalba'],
      },
    ],
  },
  {
    name: 'Singapore',
    code: 'SG',
    states: [
      {
        name: 'Central Region',
        cities: ['Downtown Core', 'Marina Bay', 'Orchard', 'Novena', 'Bukit Merah'],
      },
      {
        name: 'East Region',
        cities: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi'],
      },
      {
        name: 'West Region',
        cities: ['Jurong East', 'Jurong West', 'Clementi', 'Choa Chu Kang'],
      },
    ],
  },
  {
    name: 'Japan',
    code: 'JP',
    states: [
      {
        name: 'Kanto',
        cities: ['Tokyo', 'Yokohama', 'Kawasaki', 'Chiba', 'Saitama'],
      },
      {
        name: 'Kansai',
        cities: ['Osaka', 'Kyoto', 'Kobe', 'Nara'],
      },
    ],
  },
]
