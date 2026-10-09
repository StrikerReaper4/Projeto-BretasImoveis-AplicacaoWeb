import { FaMapMarkerAlt, FaBath, FaCarAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import { IoIosBed } from "react-icons/io";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { useState, useCallback } from "react";

/**
 * favorito / onToggleFavorito: só são passados quando há um usuário comum logado.
 * Sem eles (visitante ou admin) o botão de coração não aparece.
 */
export default function CardProperty({ property, admin, handleOpen, favorito = false, onToggleFavorito }) {
  const navigate = useNavigate();
  const redirectToWhatsapp = () => {
    const phoneNumber = "5567992609967";
    const message = `Olá, gostaria de saber mais sobre o imóvel 
        do endereço ${property.address} e do ID ${property.id}`;
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener noreferrer"
    );
  };

  if (admin === undefined) {
    admin = false;
  }
  return (
    <>
      <div className="relative bg-white min-w-[350px] min-h-[400px] rounded-xl p-4 shadow-md text-left">
        {onToggleFavorito && (
          <button
            type="button"
            onClick={() => onToggleFavorito(property.id)}
            aria-pressed={favorito}
            aria-label={favorito ? `Remover ${property.address} dos favoritos` : `Adicionar ${property.address} aos favoritos`}
            title={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="absolute top-6 right-6 z-10 bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition"
          >
            {favorito ? (
              <FaHeart size={24} className="text-red-600" aria-hidden="true" />
            ) : (
              <FaRegHeart size={24} className="text-[#0f3e58]" aria-hidden="true" />
            )}
          </button>
        )}
        <img
          src={property.img[0]}
          alt="Imagem do Imóvel"
          className="w-full h-[170px] object-cover mb-4 rounded-xl"
        />
        {admin && (
          <span className="text-[#9c894a] font-extrabold text-sm -mt-3 block">
            ID: {property.id}
          </span>
        )}
        <span className="text-[#c5ac5c] font-bold text-sm  block">
          {property.type} para {property.operation}
        </span>
        <FaMapMarkerAlt size={25} className="inline-block" />
        <h2 className="inline-block font-bold text-2xl align-middle">
          {property.address}
        </h2>
        <div className="flex justify-between mt-2">
          {/*Categorias*/}
          <div className="">
            <IoIosBed
              size={25}
              className="text-[#c5ac5c] inline-block mr-0.5"
            />
            <span className="text-[#c5ac5c] font-bold text-md -mt-3 inline-block">
              {property.items.quartos} quartos
            </span>
          </div>
          <div className="">
            <FaBath size={25} className="text-[#c5ac5c] inline-block mr-1" />
            <span className="text-[#c5ac5c] font-bold text-md -mt-3 inline-block">
              {property.items.banheiros} banheiros
            </span>
          </div>
          <div className="">
            <FaCarAlt size={25} className="text-[#c5ac5c] inline-block mr-1" />
            <span className="text-[#c5ac5c] font-bold text-md -mt-3 inline-block">
              {property.items.vagas} vagas
            </span>
          </div>
        </div>
        <p className="text-xl title font-bold text-left mt-2">
          {property.price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        {admin ? (
          <div className="flex flex-col">
            <Button
              label="Ver Detalhes"
              wid="full"
              className="p-0 mt-2"
              onClick={() => {
                navigate(`/property/${property.id}`);
              }}
            />
            <Button
              label="Editar Imóvel"
              wid="full"
              className="p-0 mt-2 bg-[#c5ac5c] hover:bg-[#978b62]"
              onClick={() => {
                handleOpen("edit", property.id);
              }}
            />
            <Button
              label="Deletar Imóvel"
              wid="full"
              className="p-0 mt-2 bg-red-600 hover:bg-red-700"
              onClick={() => {
                handleOpen("delete", property.id);
              }}
            />
          </div>
        ) : (
          <>
            <Button
              label="Ver Detalhes"
              wid="full"
              className="p-0 mt-2"
              onClick={() => {
                navigate(`/property/${property.id}`);
              }}
            />
            <Button
              label="Entrar em Contato"
              wid="full"
              className="p-0 mt-2 bg-[#c5ac5c] hover:bg-[#978b62]"
              onClick={() => redirectToWhatsapp()}
            />
          </>
        )}
      </div>
    </>
  );
}
