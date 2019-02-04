
//This constant contains all the supported timezones defined in microsoft graph:
const timezones=[   {name:"Dateline Standard Time"                    ,time:"-12"},
                    {name:"Samoa Standard Time"                       ,time:"-11"},
                    {name:"Hawaiian Standard Time"                    ,time:"-10"},//x
                    {name:"Marquesas Standard Time"                   ,time:"-9.5"},//x
                    {name:"Alaskan Standard Time"                     ,time:"-09"},//x
                    {name:"Pacific Standard Time"                     ,time:"-08"},//x
                    {name:"Mountain Standard Time"                    ,time:"-07"},//x
                    {name:"Mexico Standard Time 2"                    ,time:"-07"},
                    {name:"US Mountain Standard Time"                 ,time:"-07"},//x
                    {name:"Central Standard Time"                     ,time:"-06"},//x
                    {name:"Canada Central Standard Time"              ,time:"-06"},//x
                    {name:"Mexico Standard Time"                      ,time:"-06"},//X
                    {name:"Cuba Standard Time"                        ,time:"-05"},//X
                    {name:"Haiti Standard Time"                       ,time:"-05"},//x
                    {name:"Central America Standard Time"             ,time:"-06"},//x
                    {name:"Turks And Caicos Standard Time"            ,time:"-05"},//x
                    {name:"Libya Standard Time"                       ,time:"+02"},//x
                    {name:"Magallanes Standard Time"                  ,time:"-03"},//x
                    {name:"Tocantins Standard Time"                   ,time:"-03"},//x
                    {name:"SA Eastern Standard Time"                  ,time:"-03"},//x
                    {name:"Saint Pierre Standard Time"                ,time:"-03"},
                    {name:"Bahia Standard Time"                       ,time:"-03"},
                    {name:"West Bank Standard Time"                   ,time:"+02"},
                    {name:"Kaliningrad Standard Time"                 ,time:"+02"},
                    {name:"Sudan Standard Time"                       ,time:"+02"},
                    {name:"Belarus Standard Time"                     ,time:"+03"},
                    {name:"Astrakhan Standard Time"                   ,time:"+04"},
                    {name:"Russia Time Zone 3"                        ,time:"+04"},
                    {name:"Saratov Standard Time"                     ,time:"+04"},
                    {name:"Volgograd Standard Time"             ,time:"+04"},
                    {name:""             ,time:"+"},

                    {name:"Eastern Standard Time"                     ,time:"-05"},//x
                    {name:"US Eastern Standard Time"                  ,time:"-05"},//X
                    {name:"SA Pacific Standard Time"                  ,time:"-05"},
                    {name:"Atlantic Standard Time"                    ,time:"-04"},//x
                    {name:"SA Western Standard Time"                  ,time:"-04"},//x
                    {name:"Pacific SA Standard Time"                  ,time:"-04"},//x
                    {name:"Newfoundland Standard Time"                ,time:"-03"},//x
                    {name:"E. South America Standard Time"            ,time:"-03"},//x
                    {name:"Greenland Standard Time"                   ,time:"-03"},
                    {name:"Mid-Atlantic Standard Time"                ,time:"-02"},
                    {name:"Azores Standard Time"                      ,time:"-01"},
                    {name:"Cape Verde Standard Time"                  ,time:"-01"},
                    {name:"GMT Standard Time"                         ,time:"0"},
                    {name:"Greenwich Standard Time"                   ,time:"0"},
                    {name:"Central Europe Standard Time"              ,time:"+01"},
                    {name:"Central European Standard Time"            ,time:"+01"},
                    {name:"Romance Standard Time"                     ,time:"+01"},
                    {name:"W. Europe Standard Time"                   ,time:"+01"},
                    {name:"W. Central Africa Standard Time"           ,time:"+01"},
                    {name:"E. Europe Standard Time"                   ,time:"+02"},
                    {name:"Egypt Standard Time"                       ,time:"+02"},
                    {name:"FLE Standard Time"                         ,time:"+02"},
                    {name:"GTB Standard Time"                         ,time:"+02"},
                    {name:"Israel Standard Time"                      ,time:"+02"},
                    {name:"South Africa Standard Time"                ,time:"+02"},
                    {name:"Russian Standard Time"                     ,time:"+03"},
                    {name:"Arab Standard Time"                        ,time:"+03"},
                    {name:"E. Africa Standard Time"                   ,time:"+03"},
                    {name:"Arabic Standard Time"                      ,time:"+03"},
                    {name:"Iran Standard Time"                        ,time:"+03.5"},
                    {name:"Arabian Standard Time"                     ,time:"+04"},
                    {name:"Caucasus Standard Time"                    ,time:"+04"},
                    {name:"Transitional Islamic State of Afghanistan" ,time:"+04"},
                    {name:"Ekaterinburg Standard Time"                ,time:"+05"},
                    {name:"West Asia Standard Time"                   ,time:"+05"},
                    {name:"India Standard Time"                       ,time:"+05.5"},
                    {name:"Nepal Standard Time"                       ,time:"+05.75"},
                    {name:"Central Asia Standard Time"                ,time:"+06"},
                    {name:"Sri Lanka Standard Time"                   ,time:"+05.5"},
                    {name:"N. Central Asia Standard Time"             ,time:"+06"},
                    {name:"Myanmar Standard Time"                     ,time:"+06"},
                    {name:"SE Asia Standard Time"                   ,time:"+07"},
                    {name:"North Asia Standard Time"                  ,time:"+07"},
                    {name:"China Standard Time"                       ,time:"+08"},
                    {name:"Singapore Standard Time"                   ,time:"+08"},
                    {name:"Taipei Standard Time"                      ,time:"+08"},
                    {name:"W. Australia Standard Time"                ,time:"+08"},
                    {name:"North Asia East Standard Time"             ,time:"+08"},
                    {name:"Korea Standard Time"                       ,time:"+09"},
                    {name:"Tokyo Standard Time"                       ,time:"+09"},
                    {name:"Yakutsk Standard Time"                     ,time:"+09"},
                    {name:"A.U.S. Central Standard Time"              ,time:"+09"},
                    {name:"Cen. Australia Standard Time"              ,time:"+09"},
                    {name:"AUS Eastern Standard Time"              ,time:"+10"},
                    {name:"E. Australia Standard Time"                ,time:"+10"},
                    {name:"Tasmania Standard Time"                    ,time:"+10"},
                    {name:"Vladivostok Standard Time"                 ,time:"+10"},
                    {name:"West Pacific Standard Time"                ,time:"+10"},
                    {name:"Central Pacific Standard Time"             ,time:"+11"},
                    {name:"UTC-11"                                    ,time:"-11"},//x
                    {name:"UTC-10"                                    ,time:"-10"},
                    {name:"UTC-09"                                    ,time:"-09"},
                    {name:"UTC-08"                                    ,time:"-08"},
                    {name:"UTC-07"                                    ,time:"-07"},
                    {name:"UTC-06"                                    ,time:"-06"},
                    {name:"UTC-05"                                    ,time:"-05"},
                    {name:"UTC-04"                                    ,time:"-04"},
                    {name:"UTC-03"                                    ,time:"-03"},
                    {name:"UTC-02"                                    ,time:"-02"},
                    {name:"UTC-01"                                    ,time:"-01"},
                    {name:"Easter Island Standard Time"               ,time:"-06"},//x
                    {name:"Aleutian Standard Time"                    ,time:"-10"},//x
                    {name:"Fiji Islands Standard Time"                ,time:"+12"},
                    {name:"New Zealand Standard Time"                 ,time:"+12"},
                    {name:"Tonga Standard Time"                       ,time:"+13"},
                    {name:"Azerbaijan Standard Time"                  ,time:"-03"},
                    {name:"Middle East Standard Time"                 ,time:"+02"},
                    {name:"Jordan Standard Time"                      ,time:"+02"},
                    {name:"Central Standard Time (Mexico)"            ,time:"-06"},//x
                    {name:"Eastern Standard Time (Mexico)"            ,time:"-05"},
                    {name:"Mountain Standard Time (Mexico)"           ,time:"-07"},//x
                    {name:"Pacific Standard Time (Mexico)"            ,time:"-08"},
                    {name:"Namibia Standard Time"                     ,time:"+02"},
                    {name:"Georgian Standard Time"                    ,time:"+03"},
                    {name:"Central Brazilian Standard Time"           ,time:"-04"},//x
                    {name:"Montevideo Standard Time"                  ,time:"-03"},
                    {name:"Armenian Standard Time"                    ,time:"+04"},
                    {name:"Venezuela Standard Time"                   ,time:"-04"},//x
                    {name:"Argentina Standard Time"                   ,time:"-03"},
                    {name:"Morocco Standard Time"                     ,time:"000"},
                    {name:"Pakistan Standard Time"                    ,time:"+05"},
                    {name:"Mauritius Standard Time"                   ,time:"+04"},
                    {name:"UTC"                                       ,time:"0"},
                    {name:"Paraguay Standard Time"                    ,time:"-04"},//n
                    {name:"Afghanistan Standard Time"                 ,time:"+4.5"},
                    {name:"Kamchatka Standard Time"                   ,time:"+12"}];

exports.timezones = timezones;