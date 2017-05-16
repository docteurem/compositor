

function Compositor(params){
    
    
    var typoPath = params.typoPath;
    
    
    var font, specimens;
    var C = this;
    
    
    
    
    this.compose = function(domElem, specimenName, params){
       
       
       
       var domElemWidth = params && params.maxWidth || domElem.width();
       
       domElem.css('white-space', 'nowrap'); 
       
       var cyclofy = cyclofy || false;
       var specimen = specimens[specimenName];
       console.log(specimen);
       var content = domElem.text();
       
       var spanLocations = getSpanLocations(domElem);
       
       
       var fontSize = parseInt(domElem.css('font-size'), 10)*0.96;
       
       var fontScale = font.unitsPerEm;
       var fontHeight = (font.ascender + font.descender)/fontScale;
       domElem.empty();
       //console.log(specimen);
       var x = 0;
       
       for(var i in content){
            
            var char = content[i];
            
            
            var glyph = font.charToGlyph(char);
           
            var bb = glyph.getBoundingBox();
            
            /*console.log(char);
            console.log(glyph);
            console.log(glyph.getBoundingBox());
            */
            
            var metrics = {
                left:bb.x1/fontScale,
                right:(glyph.advanceWidth - bb.x2)/fontScale,
                top:(bb.y1)/fontScale,
                w:(bb.x2-bb.x1)/fontScale,
                h:(bb.y2-bb.y1)/fontScale
            
            };
            
            
            //top:-bb.y1/fontScale,
            
            
            var charIndex = this.getCharIndex(char, specimen);
            
            if(charIndex != -1){
                var charBox = $('<div class="char">');
                //console.log(margins);
                var letterFile = 'specimens/'+specimenName+'/'+leadZ(charIndex, 3)+'.'+specimen.extension;
                var charElem = $('<img src="'+letterFile+'">');
            }else{
                var charBox = $('<div class="space">');
                var charElem = $('<span>');
                
            }
            charElem.attr('data-loaded', 'false');
            charElem.css({ 
                 'top':Math.floor(-metrics.top*fontSize),
                 'position':'relative',
                 'height':Math.floor(metrics.h*fontSize),
                 
                 'margin-left':metrics.left*fontSize,
                 'margin-right':metrics.right*fontSize
            });
            
            charElem.on('load', function(e){
                
                $(e.target).attr('data-loaded', 'true');
                
                this.wrapLines(domElem, domElemWidth);
            }.bind(this));
            
            charBox.css({
                'display':'inline',
                'position':'relative',
                'height':fontHeight * fontSize
            });
            charBox.append(charElem);
            
            domElem.append(charBox);
            
            
            
            
            //console.log(content[i]);
        }
        this.setBoxClasses(spanLocations, domElem);
        
        
        
       
    }
    
    this.getCharIndex = function(char, specimen){
        
        for(var i in specimen.chars){
            if(specimen.chars[i] == char)
                return i;
        }
        return -1;
    }
    
    this.getSpanLocations = function(html){
        var locations = [];
        $(html).find('span').each(function(){
            var i = 0;
            var node = $(this)[0];
            while(node = node.previousSibling){
                i += $(node).text().length;
            }
            locations.push({'start':i, 
                            'end':i+$(this).text().length, 
                            'classes':$(this).attr('class')
                           });
        });
        
        return locations;
        
    }
    
    this.load = function(){
        loadSpecimen();
    }
    
    this.loadSpecimen = function(){
        
        $.getJSON("specimens/specimens.json", function(names){
            
            specimens = {};
            var nbGlyphs = names.length;
            var j = 0;
            //console.log(names);
            for(var i in names){
                
                $.getJSON('specimens/'+names[i]+'/glyphs.json', function(data){
                        
                        specimens[names[j]] = data;
                        
                        console.log(specimens);
                        if(j == nbGlyphs - 1){
                            
                            $(C).trigger('specimenLoaded');
                            C.loadTypo();
                        }
                        j++;
                
                });
                
            }
            
            
            
        });
    }
    
    this.loadTypo = function(){
        opentype.load(typoPath, function(err, data) {
            font = data;
            $(C).trigger('fontLoaded');
        
        });
    }
    
    this.setBoxClasses = function(locations, domElem){
            var elements = domElem.children();
            for(var i in locations){
                for(var j = locations[i].start; j < locations[i].end; j++){
                    $(elements[j]).addClass(locations[i].classes);
                }
            }
    }
    
    this.wrapLines = function(domElem, domElemWidth){
        
        var loadingImgs = $('img[data-loaded=false]', domElem);
       
        if($(loadingImgs).length > 0){
            
            return;
        }
        
        var charBoxes = $('div.char', domElem);
        
        charBoxes.each(function(){
            if($(this).position().left >= domElemWidth){
                var space = $(this).prevAll('.space').first();
                if(space.length > 0)
                    space.replaceWith('<br />');
            }
        });
       
        
       
    }
    
    $(this).on('fontLoaded', function(){
        $(C).trigger('loaded');
    });
    
    
    
    this.load();
    
    return this;
}


function leadZ(n,w){
  var pad=new Array(1+w).join('0');
  return (pad+n).slice(-pad.length);
}
