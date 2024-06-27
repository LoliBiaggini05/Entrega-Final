

class Paleta{

    constructor( imagen_ ){
        this.imagen = imagen_;
    }

    darUnColor( alfa_ = 255 ){
        let x = int( random( this.imagen.width ) );
        let y = int( random( this.imagen.height ) );
        let elColor = this.imagen.get( x , y );
        
        return color( red(elColor) , green(elColor) , blue( elColor ) , alfa_ );
    }


}