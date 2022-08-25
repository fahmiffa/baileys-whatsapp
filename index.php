<?php
$curl = curl_init();
$data = [
"number" => "6285640431181",// number sender
"message" => [
                "buttons" => [
                    [
                        "index"=>1,
                        "urlButton"=>[ "displayText"=>"Apply Now", "url"=> "https://api.stiker-label.com" ]
                    ],
                    [
                        "index"=>2,
                        "callButton"=>["displayText"=>"Button Call me", "phoneNumber"=>"+6285640431181"]
                    ],
                    [
                        "index"=>3,
                        "quickReplyButton"=>["displayText"=>"reply Button", "id"=>"result reply button"]
                    ]
                ],
                "buttonMessage"=>[
                    "text"=>"Hi it's a button message",
                    "footer"=>"Hello World",
                    "headerType"=>1,
                ]
            ],
"type" => "button", // type delivery            
"to" => ["6285226061579"], // number receiver
];

curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($curl, CURLOPT_URL, 'http://localhost:9000/send');
curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);

curl_setopt($curl, CURLOPT_HTTPHEADER, ['Accept: application/json','Content-Type: application/json']);
$result = curl_exec($curl);
curl_close($curl);

echo "<pre>";
print_r($result);

?>